import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { UploadOptions } from './interfaces';
import { UPLOAD_MODULE_OPTIONS } from './upload.module-definition';

export interface UploadFileResult {
  name: string;
  path: string;
  size: number;
}

export interface StoredFile {
  name: string;
  buffer: Buffer;
  size: number;
}

@Injectable()
export class UploadService {
  constructor(
    @Inject(UPLOAD_MODULE_OPTIONS)
    private readonly options: UploadOptions,
  ) {}

  private utf8FileName(path: string): string {
    return Buffer.from(basename(path), 'latin1').toString('utf8');
  }

  /**
   * Lưu nhiều file vào folder.
   * files là danh sách file từ Multer.
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folderPath?: string,
  ): Promise<UploadFileResult[]> {
    if (!files?.length) {
      throw new BadRequestException('Không có file để upload');
    }

    const targetFolder = this.resolveFolder(folderPath);

    try {
      await mkdir(targetFolder, { recursive: true });

      const results: UploadFileResult[] = [];

      for (const file of files) {
        if (!file?.buffer || !file.originalname) {
          throw new BadRequestException('File upload không hợp lệ');
        }

        // Không dùng trực tiếp đường dẫn do client gửi lên.
        const safeName = this.utf8FileName(file.originalname);
        const targetPath = join(targetFolder, safeName);

        await writeFile(targetPath, file.buffer);

        results.push({
          name: safeName,
          path: targetPath,
          size: file.buffer.length,
        });
      }

      return results;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Không thể lưu các file upload');
    }
  }

  /**
   * Đọc tất cả file trực tiếp trong folder.
   * Trả về nội dung từng file dưới dạng Buffer.
   */
  async getFiles(folderPath?: string): Promise<StoredFile[]> {
    const targetFolder = this.resolveFolder(folderPath);

    try {
      const entries = await readdir(targetFolder, {
        withFileTypes: true,
      });

      const files = entries.filter((entry) => entry.isFile());

      return await Promise.all(
        files.map(async (entry) => {
          const filePath = join(targetFolder, entry.name);
          const [buffer, fileStat] = await Promise.all([
            readFile(filePath),
            stat(filePath),
          ]);

          return {
            name: entry.name,
            buffer,
            size: fileStat.size,
          };
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Không thể đọc các file trong folder',
      );
    }
  }

  private resolveFolder(folderPath?: string): string {
    const baseFolder = resolve(this.options.uploadFolder);
    const targetFolder = resolve(baseFolder, folderPath ?? '.');

    // Chặn đường dẫn thoát khỏi uploadFolder.
    if (
      targetFolder !== baseFolder &&
      !targetFolder.startsWith(baseFolder + '\\') &&
      !targetFolder.startsWith(baseFolder + '/')
    ) {
      throw new BadRequestException('Folder path không hợp lệ');
    }

    return targetFolder;
  }
}
