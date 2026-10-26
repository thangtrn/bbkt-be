import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import PizZip from 'pizzip';
import { DocxtemplaterService } from './libs/docxtemplater/docxtemplater.service';
import { UploadService } from './libs/upload/upload.service';

@ApiTags('Upload')
@Controller()
export class AppController {
  constructor(
    private readonly docxtemplaterService: DocxtemplaterService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('render-template')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        folderPath: {
          type: 'string',
          example: './templates',
        },
        data: {
          type: 'object',
          example: {
            HoTen: 'Nguyen Van A',
            MaNV: 'NV001',
            PhongBan: 'IT',
            Luong: 15000000,
          },
        },
      },
      required: ['folderPath', 'data'],
    },
  })
  async renderTemplate(
    @Body()
    body: {
      folderPath: string;
      data: Record<string, unknown>;
    },
    @Res() res: Response,
  ): Promise<void> {
    const { folderPath, data } = body;

    if (
      !folderPath ||
      !data ||
      typeof data !== 'object' ||
      Array.isArray(data)
    ) {
      throw new BadRequestException('Cần truyền folderPath và data hợp lệ');
    }

    const files = await this.docxtemplaterService.renderTemplate(
      data,
      folderPath,
    );

    if (!files.length) {
      throw new BadRequestException('Không tìm thấy file .docx trong folder');
    }

    // Tạo ZIP bằng PizZip
    const zip = new PizZip();

    for (const file of files) {
      zip.file(file.name, file.buffer);
    }

    const zipBuffer = zip.generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6,
      },
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="rendered-templates.zip"',
    );
    res.setHeader('Content-Length', zipBuffer.length);

    res.end(zipBuffer);
  }

  @Post('upload-template-data')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        folderName: {
          type: 'string',
          example: 'hop-dong-2026',
          description: 'Tên folder lưu template và data',
        },
        templates: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        data: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['folderName', 'templates', 'data'],
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'templates', maxCount: 20 },
      { name: 'data', maxCount: 10 },
    ]),
  )
  async uploadTemplateData(
    @Body('folderName') folderName: string,
    @UploadedFiles()
    files: {
      templates?: Express.Multer.File[];
      data?: Express.Multer.File[];
    },
  ) {
    if (!folderName || !/^[a-zA-Z0-9_-]+$/.test(folderName)) {
      throw new BadRequestException('folderName không hợp lệ');
    }

    const templates = files?.templates ?? [];
    const data = files?.data ?? [];

    if (!templates.length || !data.length) {
      throw new BadRequestException(
        'Vui lòng upload ít nhất một template và một file Excel',
      );
    }

    const templateResults = await this.uploadService.uploadFiles(
      templates,
      `${folderName}/template`,
    );

    const dataResults = await this.uploadService.uploadFiles(
      data,
      `${folderName}/data`,
    );

    return {
      folderName,
      templates: templateResults,
      data: dataResults,
    };
  }
}
