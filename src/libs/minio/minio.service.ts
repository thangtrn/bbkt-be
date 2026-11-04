import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { posix } from 'node:path';
import * as Minio from 'minio';
import { MinioOptions } from './interfaces';
import { MINIO_MODULE_OPTIONS } from './minio.module-definition';

export interface MinioFileInfo {
  size: number;
  contentType: string;
  lastModified: Date;
  etag: string;
}

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly client: Minio.Client;

  constructor(
    @Inject(MINIO_MODULE_OPTIONS)
    private readonly options: MinioOptions,
  ) {
    this.client = new Minio.Client({
      endPoint: options.endPoint,
      port: options.port,
      useSSL: options.useSSL,
      accessKey: options.accessKey,
      secretKey: options.secretKey,
    });
  }

  /**
   * Initialize bucket
   */
  async onModuleInit(): Promise<void> {
    const exists = await this.client.bucketExists(this.options.bucket);

    if (!exists) {
      await this.client.makeBucket(this.options.bucket);
    }
  }

  /**
   * Upload one file
   */
  async uploadFile(file: Express.Multer.File, folder = ''): Promise<string> {
    const objectName = this.generateObjectName(file.originalname, folder);

    await this.client.putObject(
      this.options.bucket,
      objectName,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );

    return objectName;
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folder = '',
  ): Promise<string[]> {
    return Promise.all(files.map((file) => this.uploadFile(file, folder)));
  }

  /**
   * Get file content
   */
  async getFile(objectName: string): Promise<Buffer> {
    const stream = await this.client.getObject(this.options.bucket, objectName);

    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  }

  /**
   * Get file metadata
   */
  async getFileInfo(objectName: string): Promise<MinioFileInfo> {
    const stat = await this.client.statObject(this.options.bucket, objectName);

    const metadata = stat.metaData ?? {};

    const contentType =
      metadata['content-type'] ??
      metadata['Content-Type'] ??
      'application/octet-stream';

    return {
      size: stat.size,
      contentType,
      lastModified: stat.lastModified,
      etag: stat.etag,
    };
  }

  /**
   * Delete file
   */
  async deleteFile(objectName: string): Promise<void> {
    await this.client.removeObject(this.options.bucket, objectName);
  }

  /**
   * Generate presigned download URL
   */
  async getFileUrl(objectName: string, expiry = 60 * 60): Promise<string> {
    return this.client.presignedGetObject(
      this.options.bucket,
      objectName,
      expiry,
    );
  }

  /**
   * Generate object name
   */
  private generateObjectName(originalName: string, folder: string): string {
    const safeFolder = folder
      .replace(/\\/g, '/')
      .split('/')
      .filter((part) => part && part !== '.' && part !== '..')
      .join('/');

    const fileName = Buffer.from(originalName, 'latin1')
      .toString('utf8')
      .normalize('NFC');

    return safeFolder ? `${safeFolder}/${fileName}` : fileName;
  }

  // ------------- EXTRA ----------------

  async listFiles(folder: string): Promise<string[]> {
    const prefix = folder.replace(/^\/+|\/+$/g, '') + '/';

    return new Promise((resolve, reject) => {
      const files: string[] = [];

      const stream = this.client.listObjectsV2(
        this.options.bucket,
        prefix,
        true,
      );

      stream.on('data', (object) => {
        if (object.name) {
          files.push(object.name);
        }
      });

      stream.on('error', reject);

      stream.on('end', () => resolve(files));
    });
  }

  /**
   * Upload Buffer directly to MinIO.
   */
  async uploadBuffer(
    buffer: Buffer,
    objectName: string,
    contentType = 'application/octet-stream',
  ): Promise<string> {
    await this.client.putObject(
      this.options.bucket,
      objectName,
      buffer,
      buffer.length,
      {
        'Content-Type': contentType,
      },
    );

    return objectName;
  }
}
