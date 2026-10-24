import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateGenreRequestDto } from './create-genre.request.dto';

export class UpdateGenreRequestDto extends PartialType(
  OmitType(CreateGenreRequestDto, ['createdBy']),
) {
  @ApiProperty({ example: 'uuid-123' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'editorUser' })
  @IsString()
  @IsNotEmpty()
  updatedBy: string;
}
