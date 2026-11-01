import { Injectable, NotFoundException } from '@nestjs/common';
import { InsertRecordDataModel, RecordDataModel } from '@drizzle/main';
import { QueryParams } from '@/core/repositories/drizzle-client.repository.port';
import { RecordDataRepository } from './record-data.repository';

@Injectable()
export class RecordDataService {
  constructor(private readonly recordDataRepo: RecordDataRepository) {}

  async findRecordData(id: string): Promise<RecordDataModel> {
    return await this.recordDataRepo.findOneById(id);
  }

  async findAllRecordData(query: QueryParams): Promise<RecordDataModel[]> {
    return await this.recordDataRepo.findAll(query);
  }

  async createRecordData(
    entity: InsertRecordDataModel,
  ): Promise<RecordDataModel> {
    return await this.recordDataRepo.insert(entity);
  }

  async updateRecordData(
    id: string,
    entity: Partial<InsertRecordDataModel>,
  ): Promise<RecordDataModel> {
    const { id: _id, ...props } = entity;
    const record = await this.recordDataRepo.update(id, props);

    if (!record) {
      throw new NotFoundException('Record schema not found');
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
}
