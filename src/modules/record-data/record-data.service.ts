import { Injectable, NotFoundException } from '@nestjs/common';
import {
  InsertRecordDataModel,
  RecordDataModel,
  UpdateRecordDataModel,
} from '@drizzle/main';
import { QueryParams } from '@/core/repositories/drizzle-client.repository.port';
import { DocxtemplaterService } from '@/libs/docxtemplater/docxtemplater.service';
import { FieldsDefinitionValidatorService } from '@/libs/fields-definition-validator/fields-definition-validator.service';
import { UploadService } from '@/libs/upload/upload.service';
import { RecordSchemaRepository } from '../record-schema/record-schema.repository';
import { RecordDataRepository } from './record-data.repository';

@Injectable()
export class RecordDataService {
  constructor(
    private readonly recordDataRepo: RecordDataRepository,
    private readonly recordSchemaRepo: RecordSchemaRepository,
    private readonly validator: FieldsDefinitionValidatorService,
    private readonly docxtemplaterService: DocxtemplaterService,
    private readonly uploadService: UploadService,
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
    const recordData = await this.recordDataRepo.findOneById(id);
    const recordSchema = await this.recordSchemaRepo.findOneById(
      recordData.schemaId,
    );

    if (!recordData || !recordSchema) {
      throw new NotFoundException('Record data not found');
    }

    const excelData = await this.docxtemplaterService.parserExcelToJson(
      recordData.dataValues.sources.excel.file,
      recordSchema.fieldsDefinition.sources.excel,
    );

    const data = {
      ...recordData.dataValues,
      [recordSchema.fieldsDefinition.sources.excel.field]: excelData,
    };

    const result = await this.docxtemplaterService.renderDocxTemplate(
      data,
      `${recordSchema.fieldsDefinition.sources.rootFolder}/${recordSchema.fieldsDefinition.sources.docx.folder}`,
      recordData.id,
    );

    return result;
  }
}
