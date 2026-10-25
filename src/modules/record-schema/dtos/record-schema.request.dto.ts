import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateRecordSchemaRequestDto {
  @ApiProperty({
    description: 'Name of the record schema',
    example: 'Customer',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Name of the record schema',
    example: 'Customer',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string;

  @ApiProperty({
    description: 'Definition of the record schema fields',
    example: [
      {
        field: 'canBo',
        name: 'Cán bộ',
        required: true,
        type: 'string',
      },
      {
        field: 'chiHuy',
        name: 'Chỉ huy',
        required: true,
        type: 'string',
      },
      {
        field: 'canBoHuanLuyen',
        name: 'Cán bộ huấn luyện',
        required: true,
        type: 'string',
      },
      {
        field: 'ngayBatDau',
        name: 'Ngày bắt đầu',
        required: true,
        type: 'date',
      },
      {
        field: 'ngayKetThuc',
        name: 'Ngày kết thúc',
        required: true,
        type: 'date',
      },
      {
        field: 'diaBan',
        name: 'Địa bàn',
        required: true,
        type: 'string',
      },
      {
        field: 'daiDienCoSo',
        name: 'Đại diện cơ sở',
        required: true,
        type: 'string',
      },
      {
        field: 'coSo',
        name: 'Tên cơ sở',
        required: true,
        type: 'string',
      },
      {
        field: 'coSo',
        name: 'Tên cơ sở',
        required: true,
        type: 'excel',
        file: {
          sheet: 'result',
          mapping: [
            { field: 'TT', variable: 'TT' },
            { field: 'Họ Và Tên', name: 'hoTen' },
            { field: 'Cmnd/Cccd/Hộ Chiếu', name: 'cmnd' },
            { field: 'Ngày Cấp', name: 'ngayCap' },
            { field: 'Nơi Làm Việc/Nơi Thường Trú', name: 'noiLamViec' },
            { field: 'Điểm Lý Thuyết', name: 'diemLT' },
            { field: 'Điểm Thực Hành', name: 'diemTH' },
            { field: 'Đạt', name: 'dat' },
            { field: 'K. Đạt', name: 'kDat' },
          ],
        },
      },
    ],
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
  @ValidateIf((_, value) => !Array.isArray(value))
  @IsObject()
  @IsNotEmpty()
  fieldsDefinition!: Record<string, unknown> | Record<string, unknown>[];
}

export class UpdateRecordSchemaRequestDto extends PartialType(
  CreateRecordSchemaRequestDto,
) {
  @ApiProperty({ example: 'uuid-123' })
  @IsString()
  @IsNotEmpty()
  id!: string;
}
