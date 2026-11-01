import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FieldsDefinitionValidatorModule } from '@/libs/fields-definition-validator/fields-definition-validator.module';
import { RecordSchemaRepository } from '../record-schema/record-schema.repository';
import { RecordDataController } from './record-data.controller';
import { RecordDataRepository } from './record-data.repository';
import { RecordDataService } from './record-data.service';

const httpControllers = [RecordDataController];

const services: Provider[] = [RecordDataService];

const repositories: Provider[] = [RecordDataRepository, RecordSchemaRepository];

@Module({
  imports: [CqrsModule, FieldsDefinitionValidatorModule],
  controllers: [...httpControllers],
  providers: [Logger, ...services, ...repositories],
})
export class RecordDataModule {}
