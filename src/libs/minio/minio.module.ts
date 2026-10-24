import { Global, Module } from '@nestjs/common';
import { MinioModuleClass } from './minio.module-definition';
import { MinioService } from './minio.service';

@Global()
@Module({
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule extends MinioModuleClass {}
