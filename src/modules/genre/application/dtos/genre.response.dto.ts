import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '@/core/dtos';

export class GenreResponseDto extends BaseResponseDto {
  @ApiProperty({
    description: 'Slug string to uniquely identify the genre in URLs',
    example: 'action',
  })
  slug: string;

  @ApiProperty({
    description: 'Name of the genre',
    example: 'Action',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the genre',
    example: 'Action movies usually involve a lot of exciting sequences.',
  })
  description: string;

  @ApiProperty({
    description: 'User who created this genre entry',
    example: 'adminUser',
  })
  createdBy: string;

  @ApiProperty({
    description: 'User who last updated this genre entry',
    example: 'editorUser',
  })
  updatedBy: string;

  constructor(props: GenreResponseDto) {
    super();
    Object.assign(this, props);
  }
}
