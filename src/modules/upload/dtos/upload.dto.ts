import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Upload file request
 */
export class UploadFileDto {
  @ApiPropertyOptional({
    description: 'Folder lưu file trên MinIO',
    example: '1123/123123',
    default: 'documents',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  folder?: string;
}

/**
 * Upload multiple files request
 */
export class UploadFilesDto extends UploadFileDto {}

/**
 * Upload single file response
 */
export class UploadFileResponseDto {
  @ApiProperty({
    example: 'Upload successful',
  })
  message!: string;

  @ApiProperty({
    example: '1123/123123/550e8400-e29b-41d4-a716-446655440000.docx',
  })
  objectName!: string;
}

/**
 * Upload multiple files response
 */
export class UploadFilesResponseDto {
  @ApiProperty({
    example: 'Upload successful',
  })
  message!: string;

  @ApiProperty({
    type: [String],
    example: ['1123/123123/file1.docx', '1123/123123/file2.docx'],
  })
  files!: string[];
}

/**
 * File information response
 */
export class FileInfoResponseDto {
  @ApiProperty()
  objectName!: string;

  @ApiProperty()
  size!: number;

  @ApiProperty({
    example: 'application/pdf',
  })
  contentType!: string;

  @ApiProperty()
  lastModified!: Date;

  @ApiProperty()
  etag!: string;
}

/**
 * Presigned URL response
 */
export class FileUrlResponseDto {
  @ApiProperty()
  objectName!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty({
    example: 3600,
  })
  expiresIn!: number;
}

/**
 * Delete file response
 */
export class DeleteFileResponseDto {
  @ApiProperty({
    example: 'Delete successful',
  })
  message!: string;

  @ApiProperty()
  objectName!: string;
}
