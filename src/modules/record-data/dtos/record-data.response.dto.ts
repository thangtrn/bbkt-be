import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '@/core/dtos';

export class RecordDataResponseDto extends BaseResponseDto {
  @ApiProperty({
    description: 'Name of the record schema',
    example: 'LTT',
  })
  readonly schemaId!: string;

  @ApiProperty({
    description: 'Definition of the record schema fields',
    example: {},
    type: 'object',
    additionalProperties: true,
  })
  readonly dataValues!: Record<string, unknown> | Record<string, unknown>[];
}
