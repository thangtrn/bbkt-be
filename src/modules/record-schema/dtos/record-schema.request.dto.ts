import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString, MaxLength } from 'class-validator';

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
    example: {
      firstName: { type: 'string', required: true },
      age: { type: 'number', required: false },
    },
    type: 'object',
    additionalProperties: true,
  })
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
