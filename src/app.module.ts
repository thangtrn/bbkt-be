import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { RequestContextModule } from 'nestjs-request-context';
import { databaseConfig } from '@/configs/database.config';
import { HttpExceptionFilter } from '@/core/exceptions/http.exception';
import { ContextInterceptor } from '@/core/interceptors/context.interceptor';
import { LoggerInterceptor } from '@/core/interceptors/logger.interceptor';
import { DrizzleClientModule } from '@/libs/drizzle-client/drizzle-client.module';
import { minioConfig } from './configs/minio.config';
import { uploadConfig } from './configs/upload.config';
import { DocxtemplaterModule } from './libs/docxtemplater/docxtemplater.module';
import { MinioModule } from './libs/minio/minio.module';
import { RecordDataModule } from './modules/record-data/record-data.module';
import { RecordSchemaModule } from './modules/record-schema/record-schema.module';
import { UploadModule } from './modules/upload/upload.module';

const interceptors = [
  {
    provide: APP_INTERCEPTOR,
    useClass: ContextInterceptor,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: LoggerInterceptor,
  },
  {
    provide: APP_FILTER,
    useClass: HttpExceptionFilter,
  },
];

@Module({
  imports: [
    RequestContextModule,
    DrizzleClientModule.forRoot({
      databaseUrl: databaseConfig.databaseUrl,
    }),
    DocxtemplaterModule.forRoot({}),
    MinioModule.forRoot(minioConfig),

    RecordSchemaModule,
    RecordDataModule,
    UploadModule,
  ],
  controllers: [],
  providers: [...interceptors],
})
export class AppModule {}
