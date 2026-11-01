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
import { recordDataModel } from '@drizzle/main';
import { DirectFilterPipe } from '@/libs/query-builder/filter.pipe';
import {
  CreateRecordDataRequestDto,
  FindRecordDataRequestDto,
  UpdateRecordDataRequestDto,
} from './dtos/record-data.request.dto';
import { RecordDataResponseDto } from './dtos/record-data.response.dto';
import { RecordDataService } from './record-data.service';

@Controller('record-data')
export class RecordDataController {
  constructor(private recordDataService: RecordDataService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    type: RecordDataResponseDto,
  })
  @Get('/:id')
  async findRecordData(
    @Param('id') id: string,
  ): Promise<RecordDataResponseDto> {
    return await this.recordDataService.findRecordData(id);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: Array<RecordDataResponseDto>,
  })
  @Get()
  async findAllRecordData(
    @Query(
      new DirectFilterPipe({
        default: recordDataModel,
      }),
    )
    queryParams: FindRecordDataRequestDto,
  ): Promise<RecordDataResponseDto[]> {
    return await this.recordDataService.findAllRecordData(
      queryParams.findOptions,
    );
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
    type: RecordDataResponseDto,
  })
  @Post()
  async createRecordData(
    @Body() dto: CreateRecordDataRequestDto,
  ): Promise<RecordDataResponseDto> {
    return await this.recordDataService.createRecordData(dto);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: RecordDataResponseDto,
  })
  @Put(':id')
  async updateRecordData(
    @Param('id') id: string,
    @Body() dto: UpdateRecordDataRequestDto,
  ): Promise<RecordDataResponseDto> {
    return await this.recordDataService.updateRecordData(id, dto);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: RecordDataResponseDto,
  })
  @Delete(':id')
  async deleteRecordData(
    @Param('id') id: string,
  ): Promise<RecordDataResponseDto> {
    return await this.recordDataService.deleteRecordData(id);
  }
}
