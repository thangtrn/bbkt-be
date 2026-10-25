import { ConfigurableModuleBuilder } from '@nestjs/common';
import { UploadOptions } from './interfaces';

export const {
  ConfigurableModuleClass: UploadModuleClass,
  MODULE_OPTIONS_TOKEN: UPLOAD_MODULE_OPTIONS,
} = new ConfigurableModuleBuilder<UploadOptions>()
  .setClassMethodName('forRoot')
  .build();
