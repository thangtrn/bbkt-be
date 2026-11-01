import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  mkdir,
  readdir,
  readFile,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { basename, isAbsolute, join, relative, resolve, sep } from 'node:path';
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
   * Upload nhiều file vào folder.
   * Trả về relative path từ uploadFolder.
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folder?: string,
  ): Promise<UploadFileResult[]> {
    if (!files?.length) {
      throw new BadRequestException('Không có file để upload');
    }

    const targetFolder = this.resolveFolder(folder);
    const baseFolder = resolve(this.options.uploadFolder);

    try {
      await mkdir(targetFolder, { recursive: true });

      const results: UploadFileResult[] = [];

      for (const file of files) {
        if (!file?.buffer || !file.originalname) {
          throw new BadRequestException('File upload không hợp lệ');
        }

        const safeName = this.utf8FileName(file.originalname);
        const targetPath = join(targetFolder, safeName);

        await writeFile(targetPath, file.buffer);

        const relativePath = relative(baseFolder, targetPath)
          .split(sep)
          .join('/');

        results.push({
          name: safeName,
          path: `/${relativePath}`,
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
   * Xóa nhiều file bằng relative path.
   */
  async deleteFiles(paths: string[]): Promise<string[]> {
    if (!Array.isArray(paths) || paths.length === 0) {
      throw new BadRequestException('Danh sách path không hợp lệ');
    }

    const deletedPaths: string[] = [];

    for (const filePath of paths) {
      const safePath = this.resolveFilePath(filePath);

      try {
        await unlink(safePath);

        deletedPaths.push(
          `/${relative(resolve(this.options.uploadFolder), safePath)
            .split(sep)
            .join('/')}`,
        );
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          throw new NotFoundException(`Không tìm thấy file: ${filePath}`);
        }

        throw new InternalServerErrorException(
          `Không thể xóa file: ${filePath}`,
        );
      }
    }

    return deletedPaths;
  }

  /**
   * Lấy nội dung một file bằng relative path.
   */
  async getFile(filePath: string): Promise<StoredFile> {
    const safePath = this.resolveFilePath(filePath);

    try {
      const fileStat = await stat(safePath);

      if (!fileStat.isFile()) {
        throw new NotFoundException('Path không phải file');
      }

      const buffer = await readFile(safePath);

      return {
        name: basename(safePath),
        buffer,
        size: fileStat.size,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new NotFoundException('Không tìm thấy file');
      }

      throw new InternalServerErrorException('Không thể đọc file');
    }
  }

  /**
   * Kiểm tra folder nằm trong uploadFolder.
   */
  private resolveFolder(folder?: string): string {
    const baseFolder = resolve(this.options.uploadFolder);

    const normalizedFolder = (folder ?? '.')
      .replace(/\\/g, '/')
      .replace(/^\/+/, '');

    const targetFolder = resolve(baseFolder, normalizedFolder);
    const relativePath = relative(baseFolder, targetFolder);

    if (
      relativePath === '..' ||
      relativePath.startsWith(`..${sep}`) ||
      isAbsolute(relativePath)
    ) {
      throw new BadRequestException('Folder path không hợp lệ');
    }

    return targetFolder;
  }

  /**
   * Chuyển relative path thành absolute path an toàn.
   */

  private resolveFilePath(filePath: string): string {
    const baseFolder = resolve(this.options.uploadFolder);

    if (typeof filePath !== 'string' || !filePath.trim()) {
      throw new BadRequestException('File path không hợp lệ');
    }

    const normalizedPath = filePath
      .trim()
      .replace(/\\/g, '/')
      .replace(/^\/+/, '');

    // Chặn Windows absolute path và UNC path.
    if (
      /^[a-zA-Z]:/.test(normalizedPath) ||
      filePath.trim().startsWith('\\\\')
    ) {
      throw new BadRequestException('File path không hợp lệ');
    }

    // Chặn path traversal.
    if (normalizedPath.split('/').some((segment) => segment === '..')) {
      throw new BadRequestException('File path không hợp lệ');
    }

    const targetPath = resolve(baseFolder, normalizedPath);
    const relativePath = relative(baseFolder, targetPath);

    if (
      !relativePath ||
      relativePath === '..' ||
      relativePath.startsWith(`..${sep}`) ||
      isAbsolute(relativePath)
    ) {
      throw new BadRequestException('File path không hợp lệ');
    }

    return targetPath;
  }
}
