import { ConfigurableModuleBuilder } from '@nestjs/common';
import { MinioOptions } from './interfaces';

export const {
  ConfigurableModuleClass: MinioModuleClass,
  MODULE_OPTIONS_TOKEN: MINIO_MODULE_OPTIONS,
} = new ConfigurableModuleBuilder<MinioOptions>()
  .setClassMethodName('forRoot')
  .build();
