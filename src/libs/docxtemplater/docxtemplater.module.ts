import { Global, Module } from '@nestjs/common';
import { MinioModule } from '../minio/minio.module';
import { DocxtemplaterModuleClass } from './docxtemplater.module-definition';
import { DocxtemplaterService } from './docxtemplater.service';

@Global()
@Module({
  providers: [DocxtemplaterService],
  exports: [DocxtemplaterService],
})
export class DocxtemplaterModule extends DocxtemplaterModuleClass {}
