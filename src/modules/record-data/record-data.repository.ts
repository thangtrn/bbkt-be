import { Injectable } from '@nestjs/common';
import { recordDataModel } from '@drizzle/main';
import { DrizzleClientRepository } from '@/core/repositories/drizzle-client.repository.base';
import { DrizzleClientService } from '@/libs/drizzle-client/drizzle-client.service';

@Injectable()
export class RecordDataRepository extends DrizzleClientRepository<any> {
  protected model = recordDataModel;

  constructor(protected drizzleClientService: DrizzleClientService) {
    super(drizzleClientService);
  }
}
