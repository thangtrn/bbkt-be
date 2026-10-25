import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { recordSchemaModel } from '@drizzle/main';
import { DirectFilterPipe } from '@/libs/query-builder/filter.pipe';
import {
  CreateRecordSchemaRequestDto,
  FindRecordSchemaRequestDto,
  UpdateRecordSchemaRequestDto,
} from './dtos/record-schema.request.dto';
import { RecordSchemaResponseDto } from './dtos/record-schema.response.dto';
import { RecordSchemaService } from './record-schema.service';

@Controller('record-schema')
export class RecordSchemaController {
  constructor(private recordSchemaService: RecordSchemaService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    type: RecordSchemaResponseDto,
  })
  @Get('/:id')
  async findRecordSchema(
    @Param('id') id: string,
  ): Promise<RecordSchemaResponseDto> {
    return await this.recordSchemaService.findRecordSchema(id);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: Array<RecordSchemaResponseDto>,
  })
  @Get()
  async findAllRecordSchema(
    @Query(
      new DirectFilterPipe({
        default: recordSchemaModel,
      }),
    )
    queryParams: FindRecordSchemaRequestDto,
  ): Promise<RecordSchemaResponseDto[]> {
    return await this.recordSchemaService.findAllRecordSchema(
      queryParams.findOptions,
    );
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
    type: RecordSchemaResponseDto,
  })
  @Post()
  async createRecordSchema(
    @Body() dto: CreateRecordSchemaRequestDto,
  ): Promise<RecordSchemaResponseDto> {
    return await this.recordSchemaService.createRecordSchema(dto);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: RecordSchemaResponseDto,
  })
  @Put()
  async updateRecordSchema(
    @Param('id') id: string,
    @Body() dto: UpdateRecordSchemaRequestDto,
  ): Promise<RecordSchemaResponseDto> {
    return await this.recordSchemaService.updateRecordSchema(id, dto);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: RecordSchemaResponseDto,
  })
  @Delete(':id')
  async deleteRecordSchema(
    @Param('id') id: string,
  ): Promise<RecordSchemaResponseDto> {
    return await this.recordSchemaService.deleteRecordSchema(id);
  }
}
