import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '@/core/dtos';

export class RecordDataResponseDto extends BaseResponseDto {
  @ApiProperty({
    description: 'Name of the record schema',
    example: 'f8cc3e0e-c33a-4543-96fa-baf504e5ee61',
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
