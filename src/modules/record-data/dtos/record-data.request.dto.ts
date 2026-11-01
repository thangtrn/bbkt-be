import { ApiProperty, PartialType } from '@nestjs/swagger';
import { RecordDataModel } from '@drizzle/main';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { FilterDto } from '@/core/dtos';

export class FindRecordDataRequestDto extends FilterDto<RecordDataModel> {}

export class CreateRecordDataRequestDto {
  @ApiProperty({ example: 'uuid-123' })
  @IsString()
  @IsNotEmpty()
  schemaId!: string;

  @ApiProperty({
    description: 'Data of the record schema fields',
    example: {
      canBo: 'Nguyễn Đức Anh',
      chiHuy: 'Văn Hoàng Hân',
      canBoHuanLuyen: 'Huỳnh Như An',
      ngayHuanLuyen: ['19/10/2026', '20/10/2026', '21/10/2026'],
      diaBan: 'phường Tân Hiệp và phường Tân Khánh',
      daiDienCoSo: 'HE JINPING',
      coSo: 'Công ty TNHH Kỹ Thuật Tạo Khuôn LONGFA Việt Nam',
      sources: {
        rootFolder: 'LTT',
        excel: {
          folder: 'data',
          sheet: 'result',
          field: 'excelData',
          file: '/LTT/excel/LTT.xlsx',
          headerRow: 1,
          required: true,
        },
        docx: {
          folder: 'templates',
          files: ['/LTT/templates/02. Mẫu danh sach diem danh.docx'],
          required: true,
        },
      },
    },
  })
  @IsNotEmpty()
  @ValidateIf((_, value) => Array.isArray(value))
  @IsArray()
  @IsNotEmpty()
  dataValues!: Record<string, unknown>[];
}

export class UpdateRecordDataRequestDto extends PartialType(
  CreateRecordDataRequestDto,
) {
  @ApiProperty({ example: 'uuid-123' })
  @IsString()
  @IsNotEmpty()
  id!: string;
}
