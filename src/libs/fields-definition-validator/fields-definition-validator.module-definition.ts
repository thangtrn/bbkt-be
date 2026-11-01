import { ConfigurableModuleBuilder } from '@nestjs/common';
import { FieldsDefinitionValidatorOptions } from './interfaces';

export const {
  ConfigurableModuleClass: FieldsDefinitionValidatorModuleClass,
  MODULE_OPTIONS_TOKEN: FIELDS_DEFINITION_VALIDATOR_MODULE_OPTIONS,
} = new ConfigurableModuleBuilder<FieldsDefinitionValidatorOptions>()
  .setClassMethodName('forRoot')
  .build();
