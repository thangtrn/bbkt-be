import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FieldsDefinitionValidatorModule } from '@/libs/fields-definition-validator/fields-definition-validator.module';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

const httpControllers = [UploadController];

const services: Provider[] = [UploadService];

const repositories: Provider[] = [];

@Module({
  imports: [CqrsModule, FieldsDefinitionValidatorModule],
  controllers: [...httpControllers],
  providers: [Logger, ...services, ...repositories],
})
export class UploadModule {}
