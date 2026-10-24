import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({
    example: 1000,
    description: 'Total number of items',
  })
  readonly total: number;

  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
  })
  readonly limit: number;

  @ApiProperty({ example: 0, description: 'Page number' })
  readonly page: number;

  // Must be overridden in subclasses with a concrete type for Swagger to work correctly
  @ApiProperty({ isArray: true })
  readonly data: readonly T[];

  constructor(props: PaginatedResponseDto<T>) {
    this.total = props.total;
    this.limit = props.limit;
    this.page = props.page;
    this.data = props.data;
  }
}
