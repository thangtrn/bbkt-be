import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '@/core/dtos';
import { RecordSchemaResponseDto } from './record-schema.response.dto';

export class GenrePaginatedResponseDto extends PaginatedResponseDto<RecordSchemaResponseDto> {
  @ApiProperty({ isArray: true })
  declare readonly data: readonly RecordSchemaResponseDto[];
}
