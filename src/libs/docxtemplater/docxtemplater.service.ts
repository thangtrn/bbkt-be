import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { extname, posix } from 'node:path';
import Docxtemplater from 'docxtemplater';
import { lookup } from 'mime-types';
import PizZip from 'pizzip';
import * as XLSX from 'xlsx';
import { MinioService } from '@/libs/minio/minio.service';
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

    private readonly minioService: MinioService,
  ) {}

  /**
   * Normalize MinIO object key.
   *
   * Example:
   * /LTT/data/LTT.xlsx -> LTT/data/LTT.xlsx
   */
  private normalizeObjectName(objectName: string): string {
    if (!objectName?.trim()) {
      throw new BadRequestException('Object name không hợp lệ');
    }

    const normalized = objectName
      .trim()
      .replace(/\\/g, '/')
      .replace(/^\/+/, '');

    const segments = normalized.split('/');

    if (
      segments.some(
        (segment) => !segment || segment === '.' || segment === '..',
      )
    ) {
      throw new BadRequestException('Invalid MinIO object name');
    }

    return segments.join('/');
  }

  /**
   * Read Excel to JSON.
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
   * Parse Excel from MinIO to JSON.
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

    const objectName = this.normalizeObjectName(filePath);

    let excelBuffer: Buffer;

    try {
      // Đọc trực tiếp từ MinIO
      excelBuffer = await this.minioService.getFile(objectName);
    } catch (error) {
      throw new NotFoundException(
        `Không tìm thấy hoặc không thể đọc file Excel: ${objectName}`,
      );
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

  /**
   * Render all DOCX templates from MinIO folder.
   *
   * templatePath:
   * LTT/templates
   *
   * outputPath:
   * recordDataId
   *
   * Output:
   * LTT/recordDataId/*.docx
   */
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

      // Output chỉ được là tên folder
      if (
        outputPath.includes('/') ||
        outputPath.includes('\\') ||
        outputPath === '.' ||
        outputPath === '..'
      ) {
        throw new BadRequestException('Invalid output folder name');
      }

      // 2. Normalize MinIO folder
      const templatePrefix = this.normalizeObjectName(templatePath);

      const outputName = this.normalizeObjectName(outputPath);

      if (outputName.includes('/')) {
        throw new BadRequestException('Output folder chỉ được chứa một cấp');
      }

      const parentFolder = posix.dirname(templatePrefix);

      const outputPrefix =
        parentFolder === '.' ? outputName : `${parentFolder}/${outputName}`;

      // 3. Get template files from MinIO
      const objects = await this.minioService.listFiles(templatePrefix);

      const templateFiles = objects.filter((objectName) => {
        const fileName = posix.basename(objectName);

        // Chỉ lấy file trực tiếp trong folder templates
        const isDirectChild = posix.dirname(objectName) === templatePrefix;

        return (
          isDirectChild &&
          !fileName.startsWith('~$') &&
          extname(fileName).toLowerCase() === '.docx'
        );
      });

      if (templateFiles.length === 0) {
        throw new NotFoundException(
          `No .docx files found in: ${templatePrefix}`,
        );
      }

      // 4. Remove previous generated files
      const oldFiles = await this.minioService.listFiles(outputPrefix);

      if (oldFiles.length > 0) {
        await Promise.all(
          oldFiles.map((file) => this.minioService.deleteFile(file)),
        );
      }

      // 5. Render each template
      const renderedFiles: string[] = [];

      for (const templateObject of templateFiles) {
        // Read Word template from MinIO
        const templateBuffer = await this.minioService.getFile(templateObject);

        // Initialize PizZip
        const zip = new PizZip(templateBuffer);

        // Initialize Docxtemplater
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
          parser: angularParser,
        });

        // Render
        doc.render(data);

        // Generate Buffer
        const buffer = doc.getZip().generate({
          type: 'nodebuffer',
          compression: 'DEFLATE',
          compressionOptions: {
            level: 6,
          },
        });

        // Generate output object name
        const fileName = posix.basename(templateObject);

        const outputObjectName = `${outputPrefix}/${fileName}`;

        // Detect MIME type
        const contentType =
          lookup(fileName) ||
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        // Upload rendered Word to MinIO
        await this.minioService.uploadBuffer(
          buffer,
          outputObjectName,
          contentType,
        );

        renderedFiles.push(`/${outputObjectName}`);
      }

      // 6. Return result
      return {
        folderPath: `/${outputPrefix}`,
        files: renderedFiles,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException({
        message: 'Failed to render Word templates',
        detail: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
