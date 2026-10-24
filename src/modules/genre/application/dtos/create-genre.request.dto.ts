import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGenreRequestDto {
  @ApiProperty({
    description: 'Slug string to uniquely identify the genre in URLs',
    example: 'action',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    description: 'Name of the genre',
    example: 'Action',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the genre',
    example: 'Action movies usually involve a lot of exciting sequences.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'User who created this genre entry',
    example: 'adminUser',
  })
  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @ApiProperty({
    description: 'User who last updated this genre entry',
    example: 'editorUser',
  })
  @IsString()
  @IsNotEmpty()
  updatedBy: string;
}
