import { Injectable } from '@nestjs/common';
import { UploadService } from '@/libs/upload/upload.service';

@Injectable()
export class UploadFileService {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Upload nhiều file và trả về mảng path.
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folder?: string,
  ): Promise<string[]> {
    const result = await this.uploadService.uploadFiles(files, folder);

    return result.map((item) => item.path);
  }

  /**
   * Xóa nhiều file bằng mảng path.
   */
  async deleteFiles(paths: string[]): Promise<string[]> {
    return this.uploadService.deleteFiles(paths);
  }

  /**
   * Lấy một file theo path.
   */
  async getFile(path: string) {
    return this.uploadService.getFile(path);
  }
}
