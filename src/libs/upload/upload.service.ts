import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { UploadOptions } from './interfaces';
import { UPLOAD_MODULE_OPTIONS } from './upload.module-definition';

@Injectable()
export class UploadService {
  constructor(
    @Inject(UPLOAD_MODULE_OPTIONS)
    private readonly options: UploadOptions,
  ) {}

  async uploadSingleFile(
    path: string,
    files: Express.Multer.File[],
  ): Promise<string[]> {
    const uploadDir = join(process.cwd(), 'assets', path);

    try {
      // Tạo folder nếu chưa tồn tại
      await mkdir(uploadDir, { recursive: true });

      const uploadedFiles: string[] = [];

      for (const file of files) {
        const filename = basename(
          Buffer.from(file.originalname, 'latin1').toString('utf8'),
        );

        const filePath = join(uploadDir, filename);

        // Ghi file vào ổ đĩa
        await writeFile(filePath, file.buffer, { flag: 'wx' });

        uploadedFiles.push(join('assets', path, filename));
      }

      return uploadedFiles;
    } catch (error) {
      throw new InternalServerErrorException('Không thể lưu file upload');
    }
  }
}
