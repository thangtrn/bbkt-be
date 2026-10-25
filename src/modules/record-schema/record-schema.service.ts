import { Injectable, NotFoundException } from '@nestjs/common';
import { InsertRecordSchemaModel, RecordSchemaModel } from '@drizzle/main';
import { RecordSchemaRepository } from './record-schema.repository';

@Injectable()
export class RecordSchemaService {
  constructor(private readonly recordSchemaRepo: RecordSchemaRepository) {}

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
