import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class UploadFilesDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Danh sách file cần upload',
  })
  files!: Express.Multer.File[];
}

export class DeleteFilesDto {
  @ApiProperty({
    description: 'Danh sách relative path của các file cần xóa',
    example: ['/LTT/test/gumball-face.jpg', '/LTT/test/hihi.jpg'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  paths!: string[];
}
