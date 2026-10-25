import { Injectable, NotFoundException } from '@nestjs/common';
import { InsertRecordSchemaModel, RecordSchemaModel } from '@drizzle/main';
import { QueryParams } from '@/core/repositories/drizzle-client.repository.port';
import { RecordSchemaRepository } from './record-schema.repository';

@Injectable()
export class RecordSchemaService {
  constructor(private readonly recordSchemaRepo: RecordSchemaRepository) {}

  async findRecordSchema(id: string): Promise<RecordSchemaModel> {
    return await this.recordSchemaRepo.findOneById(id);
  }

  async findAllRecordSchema(query: QueryParams): Promise<RecordSchemaModel[]> {
    return await this.recordSchemaRepo.findAll(query);
  }

  async createRecordSchema(
    entity: InsertRecordSchemaModel,
  ): Promise<RecordSchemaModel> {
    return await this.recordSchemaRepo.insert(entity);
  }

  async updateRecordSchema(
    id: string,
    entity: Partial<InsertRecordSchemaModel>,
  ): Promise<RecordSchemaModel> {
    const { id: _id, ...props } = entity;
    const record = await this.recordSchemaRepo.update(id, props);

    if (!record) {
      throw new NotFoundException('Record schema not found');
    }

    return record;
  }

  async deleteRecordSchema(id: string): Promise<RecordSchemaModel> {
    const record = await this.recordSchemaRepo.delete(id);

    if (!record) {
      throw new NotFoundException('Record schema not found');
    }

    return record;
  }
}
