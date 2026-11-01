import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '@/core/dtos';
import { RecordDataResponseDto } from './record-data.response.dto';

export class GenrePaginatedResponseDto extends PaginatedResponseDto<RecordDataResponseDto> {
  @ApiProperty({ isArray: true })
  declare readonly data: readonly RecordDataResponseDto[];
}
