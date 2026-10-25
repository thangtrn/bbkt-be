import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the entity',
    example: '12312312312312312312312',
  })
  readonly id!: string;

  @ApiProperty({
    description: 'Date and time when this genre was created',
    example: '2024-04-01T10:20:30Z',
  })
  createdAt!: Date | string;

  @ApiProperty({
    description: 'Date and time when this genre was last updated',
    example: '2024-04-10T14:30:00Z',
  })
  updatedAt!: Date | string;
}
