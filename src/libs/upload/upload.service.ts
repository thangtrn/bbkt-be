import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  StreamableFile,
} from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { UploadOptions } from './interfaces';
import { UPLOAD_MODULE_OPTIONS } from './upload.module-definition';

@Injectable()
export class UploadService {
  constructor(
    @Inject(UPLOAD_MODULE_OPTIONS)
    private readonly options: UploadOptions,
  ) {}

  /**
   * Upload file lên hệ thống, tự động sửa lỗi phông chữ tiếng Việt bằng latin1 -> utf8
   * và chuẩn hóa Unicode về dạng NFC để tương thích tốt với Windows.
   */
  async uploadFiles(
    path: string,
    files: Express.Multer.File[],
  ): Promise<string[]> {
    const uploadDir = join(process.cwd(), this.options.uploadFolder, path);

    try {
      // Tạo folder nếu chưa tồn tại
      await mkdir(uploadDir, { recursive: true });

      const uploadedFiles: string[] = [];

      for (const file of files) {
        // Fix lỗi phông chữ tiếng Việt từ Multer và chuẩn hóa NFC
        const filename = basename(
          Buffer.from(file.originalname, 'latin1').toString('utf8'),
        ).normalize('NFC');

        const filePath = join(uploadDir, filename);

        // Ghi file vào ổ đĩa (chặn ghi đè bằng flag 'wx')
        await writeFile(filePath, file.buffer, { flag: 'wx' });

        uploadedFiles.push(join(this.options.uploadFolder, path, filename));
      }

      return uploadedFiles;
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };

      if (err.code === 'EEXIST') {
        throw new BadRequestException('File đã tồn tại trên hệ thống');
      }

      throw new InternalServerErrorException('Không thể lưu file upload');
    }
  }

  /**
   * Lấy danh sách toàn bộ file trong thư mục chỉ định
   */
  async getFiles(
    path = '',
  ): Promise<{ name: string; path: string; buffer: Buffer }[]> {
    const rootDir = resolve(process.cwd(), this.options.uploadFolder);
    const targetDir = resolve(rootDir, path);

    if (targetDir !== rootDir && !targetDir.startsWith(rootDir + sep)) {
      throw new BadRequestException('Folder path không hợp lệ');
    }

    const files: { name: string; path: string; buffer: Buffer }[] = [];

    const readDirectory = async (directory: string): Promise<void> => {
      const entries = await readdir(directory, {
        withFileTypes: true,
      });

      for (const entry of entries) {
        const fullPath = join(directory, entry.name);

        if (entry.isDirectory()) {
          await readDirectory(fullPath);
        } else if (entry.isFile()) {
          const buffer = await readFile(fullPath);

          files.push({
            name: entry.name,
            path: relative(rootDir, fullPath),
            buffer,
          });
        }
      }
    };

    await readDirectory(targetDir);

    return files;
  }

  /**
   * Lấy thông tin file trả về dạng buffer (nếu cần xử lý dữ liệu thô)
   */
  async getFileByPath(
    filePath: string,
  ): Promise<{ name: string; buffer: Buffer }> {
    const rootDir = resolve(process.cwd(), this.options.uploadFolder);
    const decodedPath = decodeURIComponent(filePath);
    let targetPath = resolve(rootDir, decodedPath);

    if (!targetPath.startsWith(rootDir + sep)) {
      throw new BadRequestException('Đường dẫn file không hợp lệ');
    }

    try {
      await stat(targetPath.normalize('NFC'));
    } catch {
      try {
        const dirName = dirname(targetPath);
        const requestedFilename = basename(targetPath);
        const entries = await readdir(dirName, { withFileTypes: true });
        let matchedFilename: string | null = null;

        for (const entry of entries) {
          if (
            entry.isFile() &&
            (entry.name.normalize('NFC') ===
              requestedFilename.normalize('NFC') ||
              entry.name.normalize('NFD') ===
                requestedFilename.normalize('NFD'))
          ) {
            matchedFilename = entry.name;
            break;
          }
        }

        if (matchedFilename) {
          targetPath = join(dirName, matchedFilename);
        } else {
          throw new Error('Not found');
        }
      } catch {
        throw new BadRequestException(
          'File không tồn tại hoặc không thể đọc file',
        );
      }
    }

    const buffer = await readFile(targetPath);
    return {
      name: basename(targetPath),
      buffer,
    };
  }

  /**
   * Hàm Stream file thông minh: Chống lỗi ENOENT, tự động khớp mã hóa Unicode (NFC/NFD)
   * và quét thư mục tìm file thay thế nếu có sự khác biệt nhỏ về tên.
   */
  async getFileStream(
    filePath: string,
  ): Promise<{ stream: StreamableFile; filename: string }> {
    const rootDir = resolve(process.cwd(), this.options.uploadFolder);
    const decodedPath = decodeURIComponent(filePath);
    let targetPath = resolve(rootDir, decodedPath);

    // Chặn hành vi path traversal
    if (!targetPath.startsWith(rootDir + sep)) {
      throw new BadRequestException('Đường dẫn file không hợp lệ');
    }

    try {
      // Thử tìm file theo chuẩn NFC trực tiếp
      await stat(targetPath.normalize('NFC'));
    } catch (error: unknown) {
      // Nếu lỗi ENOENT, tiến hành quét thư mục cha để đối chiếu mã hóa Unicode
      try {
        const dirName = dirname(targetPath);
        const requestedFilename = basename(targetPath);

        const entries = await readdir(dirName, { withFileTypes: true });
        let matchedFilename: string | null = null;

        for (const entry of entries) {
          if (entry.isFile()) {
            if (
              entry.name.normalize('NFC') ===
                requestedFilename.normalize('NFC') ||
              entry.name.normalize('NFD') === requestedFilename.normalize('NFD')
            ) {
              matchedFilename = entry.name;
              break;
            }
          }
        }

        if (matchedFilename) {
          targetPath = join(dirName, matchedFilename);
        } else {
          throw new Error('File not found');
        }
      } catch (scanError) {
        throw new BadRequestException(
          'File không tồn tại hoặc không thể đọc file',
        );
      }
    }

    // Trả về StreamableFile cho NestJS
    const fileStream = createReadStream(targetPath);
    const filename = basename(targetPath);

    return {
      stream: new StreamableFile(fileStream),
      filename,
    };
  }
}
