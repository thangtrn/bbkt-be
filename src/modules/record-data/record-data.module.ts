import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RecordDataController } from './record-data.controller';
import { RecordDataRepository } from './record-data.repository';
import { RecordDataService } from './record-data.service';

const httpControllers = [RecordDataController];

const services: Provider[] = [RecordDataService];

const repositories: Provider[] = [RecordDataRepository];

@Module({
  imports: [CqrsModule],
  controllers: [...httpControllers],
  providers: [Logger, ...services, ...repositories],
})
export class RecordDataModule {}
