import { Injectable, NotFoundException } from '@nestjs/common';
import {
  InsertRecordDataModel,
  RecordDataModel,
  UpdateRecordDataModel,
} from '@drizzle/main';
import { QueryParams } from '@/core/repositories/drizzle-client.repository.port';
import { FieldsDefinitionValidatorService } from '@/libs/fields-definition-validator/fields-definition-validator.service';
import { RecordSchemaRepository } from '../record-schema/record-schema.repository';
import { RecordDataRepository } from './record-data.repository';

@Injectable()
export class RecordDataService {
  constructor(
    private readonly recordDataRepo: RecordDataRepository,
    private readonly recordSchemaRepo: RecordSchemaRepository,
    private readonly validator: FieldsDefinitionValidatorService,
  ) {}

  async findRecordData(id: string): Promise<RecordDataModel> {
    return await this.recordDataRepo.findOneById(id);
  }

  async findAllRecordData(query: QueryParams): Promise<RecordDataModel[]> {
    return await this.recordDataRepo.findAll(query);
  }

  async createRecordData(
    entity: InsertRecordDataModel,
  ): Promise<RecordDataModel> {
    const recordSchema = await this.recordSchemaRepo.findOneById(
      entity.schemaId,
    );

    if (!recordSchema) {
      throw new NotFoundException('Record schema not found');
    }

    this.validator.validate<InsertRecordDataModel['dataValues']>(
      entity.dataValues,
      recordSchema.fieldsDefinition,
    );

    return await this.recordDataRepo.insert(entity);
  }

  async updateRecordData(
    id: string,
    entity: UpdateRecordDataModel,
  ): Promise<RecordDataModel> {
    if (entity.dataValues && entity.schemaId) {
      const schema = await this.recordSchemaRepo.findOneById(entity.schemaId);

      this.validator.validate<InsertRecordDataModel['dataValues']>(
        entity.dataValues,
        schema.fieldsDefinition,
        {
          partial: true,
        },
      );
    }

    const record = await this.recordDataRepo.update(id, entity);

    if (!record) {
      throw new NotFoundException('Record data not found');
    }

    return record;
  }

  async deleteRecordData(id: string): Promise<RecordDataModel> {
    const record = await this.recordDataRepo.delete(id);

    if (!record) {
      throw new NotFoundException('Record schema not found');
    }

    return record;
  }

  async parserRecordToTemplates(id: string): Promise<any> {
    return null;
  }
}
