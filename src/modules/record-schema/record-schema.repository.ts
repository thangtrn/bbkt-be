import { Injectable } from '@nestjs/common';
import { recordSchemaModel } from '@drizzle/main';
import { DrizzleClientRepository } from '@/core/repositories/drizzle-client.repository.base';
import { DrizzleClientService } from '@/libs/drizzle-client/drizzle-client.service';

@Injectable()
export class RecordSchemaRepository extends DrizzleClientRepository<any> {
  protected model = recordSchemaModel;

  constructor(protected drizzleClientService: DrizzleClientService) {
    super(drizzleClientService);
  }
}
