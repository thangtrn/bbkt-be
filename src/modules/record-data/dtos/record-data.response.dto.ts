import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '@/core/dtos';

export class RecordDataResponseDto extends BaseResponseDto {
  @ApiProperty({
    description: 'Name of the record schema',
    example: '430b2638-e052-4b24-bebd-a4f8e5b3f323',
  })
  readonly schemaId!: string;

  @ApiProperty({
    description: 'Name of the record schema',
    example: 'LTT',
  })
  readonly name!: string;

  @ApiProperty({
    description: 'Definition of the record schema fields',
    example: {},
    type: 'object',
    additionalProperties: true,
  })
  readonly dataValues!: Record<string, unknown> | Record<string, unknown>[];
}
