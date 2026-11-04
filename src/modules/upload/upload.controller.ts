import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import {
  DeleteFileResponseDto,
  FileInfoResponseDto,
  FileUrlResponseDto,
  UploadFileDto,
  UploadFileResponseDto,
  UploadFilesDto,
  UploadFilesResponseDto,
} from './dtos/upload.dto';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Upload single file
   */
  @Post('file')
  @ApiOperation({
    summary: 'Upload một file lên MinIO',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          example: '1123/123123',
          default: 'documents',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Upload thành công',
    type: UploadFileResponseDto,
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
  ) {
    return this.uploadService.uploadFile(file, dto);
  }

  /**
   * Upload multiple files
   */
  @Post('files')
  @ApiOperation({
    summary: 'Upload nhiều file lên MinIO',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        folder: {
          type: 'string',
          example: '1123/123123',
          default: 'documents',
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Upload thành công',
    type: UploadFilesResponseDto,
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    }),
  )
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadFilesDto,
  ) {
    return this.uploadService.uploadFiles(files, dto);
  }

  /**
   * Download single file
   */
  @Get('file/*key')
  @ApiOperation({
    summary: 'Download file từ MinIO',
  })
  @ApiParam({
    name: 'key',
    description: 'Object key của file',
    example: '1123/123123/example.docx',
  })
  @ApiProduces('application/octet-stream')
  @ApiResponse({
    status: 200,
    description: 'Download thành công',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async downloadFile(
    @Param('key') key: string | string[],
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const objectName = this.getPath(key);

    const result = await this.uploadService.downloadFile(objectName);

    const encodedName = encodeURIComponent(result.fileName);

    res.set({
      'Content-Type': result.info.contentType,
      'Content-Length': result.info.size,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodedName}`,
    });

    return new StreamableFile(result.buffer);
  }

  /**
   * Get file information
   */
  @Get('file-info/*key')
  @ApiOperation({
    summary: 'Lấy thông tin file',
  })
  @ApiParam({
    name: 'key',
    example: '1123/123123/example.docx',
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin file',
    type: FileInfoResponseDto,
  })
  async getFileInfo(@Param('key') key: string | string[]) {
    return this.uploadService.getFileInfo(this.getPath(key));
  }

  /**
   * Get presigned URL
   */
  @Get('file-url/*key')
  @ApiOperation({
    summary: 'Lấy URL download file từ MinIO',
  })
  @ApiParam({
    name: 'key',
    example: '1123/123123/example.docx',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy URL thành công',
    type: FileUrlResponseDto,
  })
  async getFileUrl(@Param('key') key: string | string[]) {
    return this.uploadService.getFileUrl(this.getPath(key));
  }

  /**
   * Delete file
   */
  @Delete('file/*key')
  @ApiOperation({
    summary: 'Xóa file trên MinIO',
  })
  @ApiParam({
    name: 'key',
    example: '1123/123123/example.docx',
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa thành công',
    type: DeleteFileResponseDto,
  })
  async deleteFile(@Param('key') key: string | string[]) {
    return this.uploadService.deleteFile(this.getPath(key));
  }

  /**
   * Normalize wildcard parameter
   */
  private getPath(key: string | string[]): string {
    const path = Array.isArray(key) ? key.join('/') : key;

    if (!path) {
      throw new BadRequestException('File path is required');
    }

    return path;
  }
}
