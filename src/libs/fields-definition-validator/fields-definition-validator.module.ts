import { Global, Module } from '@nestjs/common';
import { FieldsDefinitionValidatorModuleClass } from './fields-definition-validator.module-definition';
import { FieldsDefinitionValidatorService } from './fields-definition-validator.service';

@Global()
@Module({
  providers: [FieldsDefinitionValidatorService],
  exports: [FieldsDefinitionValidatorService],
})
export class FieldsDefinitionValidatorModule extends FieldsDefinitionValidatorModuleClass {}
