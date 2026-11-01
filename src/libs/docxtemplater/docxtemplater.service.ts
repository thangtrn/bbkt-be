import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, relative, resolve, sep } from 'node:path';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import * as XLSX from 'xlsx';
import { uploadConfig } from '@/configs/upload.config';
import { angularParser } from './docxtemplate.parser';
import { DOCXTEMPLATER_MODULE_OPTIONS } from './docxtemplater.module-definition';
import { DocxtemplaterOptions } from './interfaces';

// =========================
// Types
// =========================

export type ExcelRow = Record<string, unknown>;

export interface RenderedTemplateResult {
  folderPath: string;
  files: string[];
}

export type ExcelFieldType = 'string' | 'number' | 'date';

export interface ExcelMapping {
  column: string;
  field: string;
  type: ExcelFieldType;
}

export interface ExcelParserDefinition {
  folder: string;
  required: boolean;
  sheet: string;
  field: string;
  headerRow: number;
  mapping: ExcelMapping[];
}

// =========================
// Service
// =========================

@Injectable()
export class DocxtemplaterService {
  constructor(
    @Inject(DOCXTEMPLATER_MODULE_OPTIONS)
    private readonly options: DocxtemplaterOptions,
  ) {}

  /**
   * Resolve file path.
   *
   * Example:
   * /LTT/excel/LTT.xlsx
   * -> <process.cwd()>/LTT/excel/LTT.xlsx
   *
   * Windows absolute path is also supported.
   */
  private resolveFilePath(filePath: string): string {
    if (!filePath?.trim()) {
      throw new BadRequestException('File path không hợp lệ');
    }

    const normalizedPath = filePath.trim();

    // Windows absolute path: C:\... or D:/...
    if (/^[a-zA-Z]:[\\/]/.test(normalizedPath)) {
      return resolve(normalizedPath);
    }

    // Project-relative path
    return resolve(
      process.cwd(),
      uploadConfig.uploadFolder,
      normalizedPath.replace(/^[/\\]+/, ''),
    );
  }

  /**
   * Read Excel to JSON.
   *
   * If sheet provided:
   * Promise<ExcelRow[]>
   *
   * If sheet omitted:
   * Promise<Record<string, ExcelRow[]>>
   */
  async loadExcelFile(
    excel: Buffer,
    sheet?: string,
  ): Promise<ExcelRow[] | Record<string, ExcelRow[]>> {
    if (!Buffer.isBuffer(excel) || excel.length === 0) {
      throw new BadRequestException('Excel buffer không hợp lệ');
    }

    try {
      const workbook = XLSX.read(excel, {
        type: 'buffer',
        cellDates: true,
      });

      if (!workbook.SheetNames.length) {
        throw new BadRequestException('Excel không có sheet nào');
      }

      if (sheet) {
        const worksheet = workbook.Sheets[sheet];

        if (!worksheet) {
          throw new BadRequestException(`Không tìm thấy sheet "${sheet}"`);
        }

        return XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
          defval: '',
          raw: false,
        });
      }

      const result: Record<string, ExcelRow[]> = {};

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];

        result[sheetName] = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
          defval: '',
          raw: false,
        });
      }

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        'Không thể đọc file Excel. Hãy kiểm tra định dạng file.',
      );
    }
  }

  /**
   * Parse Excel file path to JSON using fieldsDefinition.sources.excel.
   *
   * Input:
   * - filePath: record.data.sources.excel.file
   * - definition: fieldsDefinition.sources.excel
   *
   * Output:
   * ExcelRow[]
   */
  async parserExcelToJson(
    filePath: string,
    definition: ExcelParserDefinition,
  ): Promise<ExcelRow[]> {
    if (!definition) {
      throw new BadRequestException('Excel definition không hợp lệ');
    }

    const { sheet, headerRow, mapping } = definition;

    if (!sheet?.trim()) {
      throw new BadRequestException('Excel sheet không được để trống');
    }

    if (!Number.isInteger(headerRow) || headerRow < 1) {
      throw new BadRequestException(
        'Excel headerRow phải là số nguyên lớn hơn 0',
      );
    }

    if (!Array.isArray(mapping) || mapping.length === 0) {
      throw new BadRequestException(
        'Excel mapping không hợp lệ hoặc đang trống',
      );
    }

    const targetPath = this.resolveFilePath(filePath);

    console.log('Resolved Excel file path:', targetPath);

    let excelBuffer: Buffer;

    try {
      excelBuffer = await readFile(targetPath);
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        throw new NotFoundException(`Không tìm thấy file Excel: ${filePath}`);
      }

      throw new InternalServerErrorException('Không thể đọc file Excel');
    }

    try {
      const workbook = XLSX.read(excelBuffer, {
        type: 'buffer',
        cellDates: true,
      });

      const worksheet = workbook.Sheets[sheet];

      if (!worksheet) {
        throw new BadRequestException(`Không tìm thấy sheet "${sheet}"`);
      }

      // headerRow bắt đầu từ 1, range của XLSX bắt đầu từ 0.
      const rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
        range: headerRow - 1,
        defval: '',
        raw: false,
      });

      return rows.map((row) => {
        const result: ExcelRow = {};

        for (const item of mapping) {
          if (!item.column?.trim() || !item.field?.trim()) {
            throw new BadRequestException(
              'Excel mapping thiếu column hoặc field',
            );
          }

          result[item.field] = this.convertExcelValue(
            row[item.column],
            item.type,
          );
        }

        return result;
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        `Không thể parse Excel: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Convert Excel value according to mapping type.
   */
  private convertExcelValue(value: unknown, type: ExcelFieldType): unknown {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    switch (type) {
      case 'string':
        return String(value).trim();

      case 'number': {
        const number = Number(value);

        return Number.isFinite(number) ? number : '';
      }

      case 'date': {
        if (value instanceof Date) {
          return this.formatDate(value);
        }

        const text = String(value).trim();

        // Already dd/MM/yyyy
        const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

        if (match) {
          const [, day, month, year] = match;

          const date = new Date(Number(year), Number(month) - 1, Number(day));

          if (
            date.getFullYear() === Number(year) &&
            date.getMonth() === Number(month) - 1 &&
            date.getDate() === Number(day)
          ) {
            return text;
          }

          return '';
        }

        const date = new Date(text);

        return Number.isNaN(date.getTime()) ? '' : this.formatDate(date);
      }

      default:
        throw new BadRequestException(
          `Kiểu dữ liệu Excel không được hỗ trợ: ${type}`,
        );
    }
  }

  /**
   * Format Date to dd/MM/yyyy.
   */
  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  async renderDocxTemplate<T extends Record<string, unknown>>(
    data: T,
    templatePath: string,
    outputPath: string,
  ): Promise<RenderedTemplateResult> {
    try {
      // 1. Validate input
      if (!templatePath?.trim()) {
        throw new BadRequestException('Template path is required');
      }

      if (!outputPath?.trim()) {
        throw new BadRequestException('Output path is required');
      }

      // outputPath chỉ được là tên folder, không cho phép path traversal
      if (
        basename(outputPath) !== outputPath ||
        outputPath === '.' ||
        outputPath === '..'
      ) {
        throw new BadRequestException('Invalid output folder name');
      }

      // 2. Resolve đường dẫn folder template
      const templateDir = this.resolveFilePath(templatePath);

      // 3. Lấy danh sách file trong folder
      const entries = await readdir(templateDir, {
        withFileTypes: true,
      });

      const templateFiles = entries.filter(
        (entry) =>
          entry.isFile() &&
          !entry.name.startsWith('~$') &&
          extname(entry.name).toLowerCase() === '.docx',
      );

      if (templateFiles.length === 0) {
        throw new NotFoundException(`No .docx files found in: ${templatePath}`);
      }

      // 4. Tạo output folder cùng cấp với folder templates
      const outputDir = resolve(dirname(templateDir), outputPath);

      // Kiểm tra outputDir nằm trong thư mục cha của templates
      const parentDir = dirname(templateDir);

      if (!outputDir.startsWith(`${parentDir}${sep}`)) {
        throw new BadRequestException('Invalid output path');
      }

      // Xóa kết quả cũ nếu đã tồn tại
      await rm(outputDir, {
        recursive: true,
        force: true,
      });

      await mkdir(outputDir, {
        recursive: true,
      });

      // 5. Render từng file Word
      const renderedFiles: string[] = [];

      for (const file of templateFiles) {
        const sourcePath = resolve(templateDir, file.name);

        // Đọc template
        const templateBuffer = await readFile(sourcePath);

        // Khởi tạo PizZip
        const zip = new PizZip(templateBuffer);

        // Khởi tạo Docxtemplater
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
          parser: angularParser,
        });

        // Render dữ liệu
        doc.render(data);

        // Xuất Buffer
        const buffer = doc.getZip().generate({
          type: 'nodebuffer',
          compression: 'DEFLATE',
          compressionOptions: {
            level: 6,
          },
        });

        // Ghi file vào output folder
        const outputFilePath = resolve(outputDir, file.name);

        await writeFile(outputFilePath, buffer);

        // Lưu đường dẫn tương đối theo uploadFolder
        const relativeFilePath = `/${relative(
          resolve(process.cwd(), uploadConfig.uploadFolder),
          outputFilePath,
        )
          .split(sep)
          .join('/')}`;

        renderedFiles.push(relativeFilePath);
      }

      // 6. Trả kết quả
      const relativeFolderPath = `/${relative(
        resolve(process.cwd(), uploadConfig.uploadFolder),
        outputDir,
      )
        .split(sep)
        .join('/')}`;

      return {
        folderPath: relativeFolderPath,
        files: renderedFiles,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new NotFoundException(
          `Template folder not found: ${templatePath}`,
        );
      }

      throw new InternalServerErrorException({
        message: 'Failed to render Word templates',
        detail: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
