import { ApiProperty, PartialType } from '@nestjs/swagger';
import { RecordDataModel } from '@drizzle/main';
import { IsNotEmpty, IsObject, IsString, ValidateIf } from 'class-validator';
import { FilterDto } from '@/core/dtos';

export class FindRecordDataRequestDto extends FilterDto<RecordDataModel> {}

export class CreateRecordDataRequestDto {
  @ApiProperty({ example: '430b2638-e052-4b24-bebd-a4f8e5b3f323' })
  @IsString()
  @IsNotEmpty()
  schemaId!: string;

  @ApiProperty({ example: 'LTT 1' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Data of the record schema fields',
    example: {
      canBo: 'Đại úy Nguyễn Đức Anh',
      chiHuy: 'Trung tá Văn Hoàng Hân',
      canBoHuanLuyen: 'Huỳnh Như An',
      ngayHuanLuyen: ['19/10/2026', '20/10/2026', '21/10/2026'],
      diaBan: 'phường Tân Hiệp và phường Tân Khánh',
      daiDienCoSo: 'HE JINPING',
      coSo: 'Công ty TNHH Kỹ Thuật Tạo Khuôn LONGFA Việt Nam',
      sources: {
        excel: {
          file: '/LTT/excel/LTT.xlsx',
        },
        docx: {
          files: ['/LTT/templates/02. Mẫu danh sach diem danh.docx'],
        },
      },
    },
  })
  @IsNotEmpty()
  @ValidateIf((_, value) => !Array.isArray(value))
  @IsObject()
  dataValues!: Record<string, unknown>;
}

export class UpdateRecordDataRequestDto extends PartialType(
  CreateRecordDataRequestDto,
) {}
