import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
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
  ApiParam,
  ApiQuery,
  ApiResponse,
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

    return this.uploadService.uploadFiles(path || 'uploads', files);
  }

  @Get('files')
  @ApiOperation({ summary: 'Lấy danh sách file và nội dung' })
  @ApiQuery({
    name: 'path',
    required: false,
    description: 'Đường dẫn thư mục con bên trong assets cần lấy file',
    example: 'templates',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách file thành công',
    schema: {
      example: [
        {
          name: 'example.docx',
          path: 'templates/example.docx',
          buffer: {
            type: 'Buffer',
            data: '[80, 75, 3, 4, ...]', // Dữ liệu buffer của file
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Folder path không hợp lệ',
  })
  async getFilesInFolder(@Query('path') path?: string) {
    return await this.uploadService.getFiles(path || '');
  }

  @Get('file-download')
  @ApiOperation({
    summary: 'Tải hoặc xem trực tiếp file qua Query Path',
  })
  @ApiQuery({
    name: 'path',
    required: true,
    description: 'Đường dẫn tương đối của file bên trong assets',
    example: '123/1. Kế hoạch thực tập phương án.docx',
  })
  @ApiResponse({
    status: 200,
    description: 'Load file thành công',
  })
  @ApiBadRequestResponse({
    description: 'Đường dẫn file không hợp lệ hoặc file không tồn tại',
  })
  async getFileByQuery(
    @Query('path') filePath: string,
    @Res({ passthrough: true }) res: any,
  ): Promise<StreamableFile> {
    const { stream, filename } =
      await this.uploadService.getFileStream(filePath);

    res.setHeader(
      'Content-Disposition',
      `inline; filename*=UTF-8''${encodeURIComponent(filename)}`,
    );

    return stream;
  }
}
