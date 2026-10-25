import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UploadService } from './libs/upload/upload.service';

@ApiTags('Upload')
@Controller()
export class AppController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('uploads')
  @ApiOperation({ summary: 'Upload nhiều file' })
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
          description: 'Danh sách file cần upload',
        },
        path: {
          type: 'string',
          example: 'templates',
          description: 'Thư mục lưu file bên trong assets',
        },
      },
      required: ['files'],
    },
  })
  @ApiCreatedResponse({
    description: 'Upload file thành công',
    schema: {
      example: [
        'assets/templates/example.docx',
        'assets/templates/example.xlsx',
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Không có file được upload',
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('path') path: string,
  ) {
    if (!files?.length) {
      throw new BadRequestException('Vui lòng chọn file');
    }

    return this.uploadService.uploadSingleFile(path || 'uploads', files);
  }
}
