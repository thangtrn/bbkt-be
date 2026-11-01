import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { DeleteFilesDto, UploadFilesDto } from './dto/upload-file.request.dto';
import { UploadFileService } from './upload-file.service';

@Controller('uploads')
export class UploadFileController {
  constructor(private readonly uploadFileService: UploadFileService) {}

  @Post()
  @ApiOperation({ summary: 'Upload nhiều file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadFilesDto,
  })
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    }),
  )
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder?: string,
  ): Promise<string[]> {
    return this.uploadFileService.uploadFiles(files, folder);
  }

  /**
   * Xóa nhiều file.
   */
  @Delete()
  @ApiOperation({ summary: 'Xóa nhiều file' })
  @ApiBody({ type: DeleteFilesDto })
  async deleteFiles(@Body() body: DeleteFilesDto): Promise<string[]> {
    return this.uploadFileService.deleteFiles(body.paths);
  }

  /**
   * Lấy nội dung một file.
   */
  @Get('file')
  async getFile(@Query('path') path: string): Promise<StreamableFile> {
    if (!path) {
      throw new BadRequestException('Vui lòng truyền path của file');
    }

    const file = await this.uploadFileService.getFile(path);

    return new StreamableFile(file.buffer, {
      type: 'application/octet-stream',
      disposition: `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
    });
  }
}
