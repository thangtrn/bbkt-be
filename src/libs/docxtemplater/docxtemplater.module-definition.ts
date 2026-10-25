import { ConfigurableModuleBuilder } from '@nestjs/common';
import { DocxtemplaterOptions } from './interfaces';

export const {
  ConfigurableModuleClass: DocxtemplaterModuleClass,
  MODULE_OPTIONS_TOKEN: DOCXTEMPLATER_MODULE_OPTIONS,
} = new ConfigurableModuleBuilder<DocxtemplaterOptions>()
  .setClassMethodName('forRoot')
  .build();
