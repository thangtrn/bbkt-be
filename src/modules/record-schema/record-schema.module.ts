import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RecordSchemaController } from './record-schema.controller';
import { RecordSchemaRepository } from './record-schema.repository';
import { RecordSchemaService } from './record-schema.service';

const httpControllers = [RecordSchemaController];

const services: Provider[] = [RecordSchemaService];

const repositories: Provider[] = [RecordSchemaRepository];

@Module({
  imports: [CqrsModule],
  controllers: [...httpControllers],
  providers: [Logger, ...services, ...repositories],
})
export class RecordSchemaModule {}
