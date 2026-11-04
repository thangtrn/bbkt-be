import { BadRequestException, Injectable } from '@nestjs/common';
import { MinioService } from '@/libs/minio/minio.service';
import { UploadFileDto, UploadFilesDto } from './dtos/upload.dto';

@Injectable()
export class UploadService {
  constructor(private readonly minioService: MinioService) {}

  /**
   * Upload single file
   */
  async uploadFile(file: Express.Multer.File, dto: UploadFileDto) {
    this.validateFile(file);

    const folder = this.normalizeFolder(dto.folder);

    const objectName = await this.minioService.uploadFile(file, folder);

    return {
      message: 'Upload successful',
      objectName,
    };
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(files: Express.Multer.File[], dto: UploadFilesDto) {
    if (!files?.length) {
      throw new BadRequestException('Please upload at least one file');
    }

    files.forEach((file) => this.validateFile(file));

    const folder = this.normalizeFolder(dto.folder);

    const objectNames = await this.minioService.uploadFiles(files, folder);

    return {
      message: 'Upload successful',
      files: objectNames,
    };
  }

  /**
   * Download single file
   */
  async downloadFile(objectName: string) {
    const key = this.normalizeObjectName(objectName);

    const [info, buffer] = await Promise.all([
      this.minioService.getFileInfo(key),
      this.minioService.getFile(key),
    ]);

    return {
      info,
      buffer,
      fileName: key.split('/').pop() ?? 'file',
    };
  }

  /**
   * Get file information
   */
  async getFileInfo(objectName: string) {
    const key = this.normalizeObjectName(objectName);

    const info = await this.minioService.getFileInfo(key);

    return {
      objectName: key,
      ...info,
    };
  }

  /**
   * Get presigned URL
   */
  async getFileUrl(objectName: string, expiry = 3600) {
    const key = this.normalizeObjectName(objectName);

    if (!Number.isInteger(expiry) || expiry < 1 || expiry > 7 * 24 * 60 * 60) {
      throw new BadRequestException(
        'Expiry must be between 1 and 604800 seconds',
      );
    }

    const url = await this.minioService.getFileUrl(key, expiry);

    return {
      objectName: key,
      url,
      expiresIn: expiry,
    };
  }

  /**
   * Delete file
   */
  async deleteFile(objectName: string) {
    const key = this.normalizeObjectName(objectName);

    // Check whether file exists
    await this.minioService.getFileInfo(key);

    await this.minioService.deleteFile(key);

    return {
      message: 'Delete successful',
      objectName: key,
    };
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('Please upload a file');
    }
  }

  /**
   * Normalize folder path
   */
  private normalizeFolder(folder?: string): string {
    if (!folder) {
      return 'documents';
    }

    const normalized = folder.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');

    if (normalized.split('/').some((part) => part === '.' || part === '..')) {
      throw new BadRequestException('Invalid folder path');
    }

    return normalized;
  }

  /**
   * Validate object name
   */
  private normalizeObjectName(objectName: string): string {
    const normalized = objectName?.replace(/\\/g, '/').replace(/^\/+/, '');

    if (
      !normalized ||
      normalized.split('/').some((part) => part === '.' || part === '..')
    ) {
      throw new BadRequestException('Invalid object name');
    }

    return normalized;
  }
}
