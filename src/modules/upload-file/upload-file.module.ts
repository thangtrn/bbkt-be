import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UploadModule } from '@/libs/upload/upload.module';
import { UploadFileController } from './upload-file.controller';
import { UploadFileService } from './upload-file.service';

const httpControllers = [UploadFileController];

const services: Provider[] = [UploadFileService];

const repositories: Provider[] = [];

@Module({
  imports: [CqrsModule],
  controllers: [...httpControllers],
  providers: [Logger, ...services, ...repositories],
})
export class UploadFileModule {}
