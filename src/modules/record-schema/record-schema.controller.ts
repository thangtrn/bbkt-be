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

@Controller('record-schema')
export class RecordSchemaController {}
