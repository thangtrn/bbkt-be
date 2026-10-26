import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import * as XLSX from 'xlsx';
import { DOCXTEMPLATER_MODULE_OPTIONS } from './docxtemplater.module-definition';
import { DocxtemplaterOptions } from './interfaces';

export type ExcelRow = Record<string, unknown>;

export interface RenderedFile {
  name: string;
  buffer: Buffer;
}

@Injectable()
export class DocxtemplaterService {
  constructor(
    @Inject(DOCXTEMPLATER_MODULE_OPTIONS)
    private readonly options: DocxtemplaterOptions,
  ) {}

  /**
   * Đọc Excel thành JSON.
   *
   * Có sheet:
   *   Promise<ExcelRow[]>
   *
   * Không có sheet:
   *   Promise<Record<string, ExcelRow[]>>
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
   * Đọc tất cả file .docx trong folder, render theo data,
   * rồi trả về nội dung file dưới dạng Buffer.
   */
  async renderTemplate<T extends Record<string, unknown>>(
    data: T,
    folderPath: string,
  ): Promise<RenderedFile[]> {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequestException('Data phải là một object');
    }

    if (!folderPath?.trim()) {
      throw new BadRequestException('folderPath không hợp lệ');
    }

    const targetFolder = resolve(folderPath);

    try {
      const entries = await readdir(targetFolder, {
        withFileTypes: true,
      });

      const templateFiles = entries.filter(
        (entry) =>
          entry.isFile() &&
          extname(entry.name).toLowerCase() === '.docx' &&
          !entry.name.startsWith('~$'),
      );

      if (!templateFiles.length) {
        return [];
      }

      const renderedFiles: RenderedFile[] = [];

      for (const entry of templateFiles) {
        const filePath = join(targetFolder, entry.name);
        const templateBuffer = await readFile(filePath);

        try {
          const zip = new PizZip(templateBuffer);

          const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
          });

          doc.render(data);

          const output = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
          });

          renderedFiles.push({
            name: this.getOutputName(entry.name),
            buffer: output,
          });
        } catch (error) {
          throw new Error(
            `Lỗi render template "${entry.name}": ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }

      return renderedFiles;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Không thể render template',
      );
    }
  }

  private getOutputName(templateName: string): string {
    const extension = extname(templateName);
    const name = templateName.slice(0, -extension.length);

    return `${name}-rendered.docx`;
  }
}
