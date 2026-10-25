import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '@/core/dtos';

export class RecordSchemaResponseDto extends BaseResponseDto {
  @ApiProperty({
    description: 'Name of the record schema',
    example: 'Customer',
  })
  readonly name!: string;

  @ApiProperty({
    description: 'Definition of the record schema fields',
    example: {
      firstName: { type: 'string', required: true },
      age: { type: 'number', required: false },
    },
    type: 'object',
    additionalProperties: true,
  })
  readonly fieldsDefinition!: Record<string, unknown>;
}
