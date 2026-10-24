import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '@/core/dtos';
import { GenreResponseDto } from './genre.response.dto';

export class GenrePaginatedResponseDto extends PaginatedResponseDto<GenreResponseDto> {
  @ApiProperty({ isArray: true })
  declare readonly data: readonly GenreResponseDto[];
}
