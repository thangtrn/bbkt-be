import { ConfigurableModuleBuilder } from '@nestjs/common';
import { DrizzleClientOptions } from './interfaces';

export const {
  ConfigurableModuleClass: DrizzleClientModuleClass,
  MODULE_OPTIONS_TOKEN: DRIZZLE_CLIENT_MODULE_OPTIONS,
} = new ConfigurableModuleBuilder<DrizzleClientOptions>()
  .setClassMethodName('forRoot')
  .build();
