import { Inject, Injectable } from '@nestjs/common';
import { Client } from 'minio';
import { MinioOptions } from './interfaces';
import { MINIO_MODULE_OPTIONS } from './minio.module-definition';

@Injectable()
export class MinioService {
  private readonly _client: Client;

  constructor(
    @Inject(MINIO_MODULE_OPTIONS)
    private readonly options: MinioOptions,
  ) {
    this._client = new Client(options);
  }
}
