import {
  INestApplication,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationError } from 'class-validator';
import { json, urlencoded } from 'express';
import { systemConfig } from '@/configs/system.config';
import { AppModule } from './app.module';
import { HttpErrorCode } from './core/constants';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('query parser', 'extended'); // for nested query parameters
  swaggerUI(app);

  app.use(json());
  app.use(urlencoded());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (validationErrors: ValidationError[]) => {
        const errorDetails = validationErrors.map((error) => {
          const field = error.property;
          const value = error.value;
          const constraints = error.constraints || {};
          const messages = Object.values(constraints);

          return {
            field,
            value,
            message: messages,
          };
        });

        return new UnprocessableEntityException({
          message: 'Validation error',
          errorCode: HttpErrorCode.UNPROCESSABLE_ENTITY,
          error: errorDetails,
        });
      },
    }),
  );

  app.enableCors();
  app.enableShutdownHooks();

  await app.listen(systemConfig.port);
}
bootstrap();

function swaggerUI(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setVersion('1.0')
    .setTitle('API Documentation')
    .setDescription('The API documentation for the application')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
}
