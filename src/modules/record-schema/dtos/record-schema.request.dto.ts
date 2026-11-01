import { ApiProperty, PartialType } from '@nestjs/swagger';
import { RecordSchemaModel } from '@drizzle/main';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { FilterDto } from '@/core/dtos';

export class FindRecordSchemaRequestDto extends FilterDto<RecordSchemaModel> {}

export class CreateRecordSchemaRequestDto {
  @ApiProperty({
    description: 'Name of the record schema',
    example: 'LTT',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Name of the record schema',
    example: 'LTT',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string;

  @ApiProperty({
    description: 'Definition of the record schema fields',
    example: {
      version: 1,
      fields: [
        {
          name: 'Cán bộ',
          field: 'canBo',
          type: 'string',
          required: true,
        },
        {
          name: 'Chỉ huy',
          field: 'chiHuy',
          type: 'string',
          required: true,
        },
        {
          name: 'Cán bộ huấn luyện',
          field: 'canBoHuanLuyen',
          type: 'string',
          required: true,
        },
        {
          name: 'Ngày huấn luyện',
          field: 'ngayHuanLuyen',
          type: 'array',
          required: true,
        },
        {
          name: 'Địa bàn',
          field: 'diaBan',
          type: 'string',
          required: true,
        },
        {
          name: 'Đại diện cơ sở',
          field: 'daiDienCoSo',
          type: 'string',
          required: true,
        },
        {
          name: 'Tên cơ sở',
          field: 'coSo',
          type: 'string',
          required: true,
        },
      ],
      sources: {
        rootFolder: 'LTT',
        excel: {
          folder: 'excel',
          required: true,
          sheet: 'result',
          field: 'excelData',
          headerRow: 1,
          mapping: [
            {
              column: 'TT',
              field: 'TT',
              type: 'number',
            },
            {
              column: 'Họ Và Tên',
              field: 'hoTen',
              type: 'string',
            },
            {
              column: 'NamSinh',
              field: 'namSinh',
              type: 'string',
            },
            {
              column: 'Cmnd/Cccd/Hộ Chiếu',
              field: 'cmnd',
              type: 'string',
            },
            {
              column: 'Ngày Cấp',
              field: 'ngayCap',
              type: 'date',
            },
            {
              column: 'Nơi Làm Việc/Nơi Thường Trú',
              field: 'noiLamViec',
              type: 'string',
            },
            {
              column: 'Điểm Lý Thuyết',
              field: 'diemLT',
              type: 'number',
            },
            {
              column: 'Điểm Thực Hành',
              field: 'diemTH',
              type: 'number',
            },
            {
              column: 'Đạt',
              field: 'dat',
              type: 'string',
            },
            {
              column: 'K. Đạt',
              field: 'kDat',
              type: 'string',
            },
          ],
        },
        docx: {
          folder: 'templates',
          required: true,
        },
      },
    },
    oneOf: [
      {
        type: 'object',
        additionalProperties: true,
      },
      {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: true,
        },
      },
    ],
  })
  @IsNotEmpty()
  @ValidateIf((_, value) => Array.isArray(value))
  @IsArray()
  @IsNotEmpty()
  fieldsDefinition!: Record<string, unknown>[];
}

export class UpdateRecordSchemaRequestDto extends PartialType(
  CreateRecordSchemaRequestDto,
) {
  @ApiProperty({ example: 'uuid-123' })
  @IsString()
  @IsNotEmpty()
  id!: string;
}
