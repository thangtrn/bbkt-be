import { Global, Module } from '@nestjs/common';
import { UploadModuleClass } from './upload.module-definition';
import { UploadService } from './upload.service';

@Global()
@Module({
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule extends UploadModuleClass {}
