import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '@nestjs/swagger';
import { CreateGenreCommand } from '../../application/commands/create-genre.command';
import { DeleteGenreCommand } from '../../application/commands/delete-genre.command';
import { UpdateGenreCommand } from '../../application/commands/update-genre.command';
import { CreateGenreRequestDto } from '../../application/dtos/create-genre.request.dto';
import { GenreResponseDto } from '../../application/dtos/genre.response.dto';
import { UpdateGenreRequestDto } from '../../application/dtos/update-genre.request.dto';

@Controller('genre')
export class GenreController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
    type: GenreResponseDto,
  })
  @Post()
  async createGenre(
    @Body() createGenreRequestDto: CreateGenreRequestDto,
  ): Promise<GenreResponseDto> {
    const result = await this.commandBus.execute(
      new CreateGenreCommand(createGenreRequestDto),
    );

    return new GenreResponseDto(result.getProps());
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: GenreResponseDto,
  })
  @Put()
  async updateGenre(
    @Body() updateGenreRequestDto: UpdateGenreRequestDto,
  ): Promise<GenreResponseDto> {
    const result = await this.commandBus.execute(
      new UpdateGenreCommand(updateGenreRequestDto),
    );

    return new GenreResponseDto(result.getProps());
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: GenreResponseDto,
  })
  @Delete(':id')
  async deleteGenre(@Param('id') id: string): Promise<GenreResponseDto> {
    const result = await this.commandBus.execute(new DeleteGenreCommand(id));

    return new GenreResponseDto(result.getProps());
  }
}
