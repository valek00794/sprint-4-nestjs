import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';

import { AppModule } from 'src/app.module';
import { HttpExceptionFilter } from 'src/infrastructure/exception.filter';
import { APIErrorResult } from 'src/infrastructure/exception.filter.types';

export const applyAppSettings = (app: INestApplication) => {
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const errorsForResponse: APIErrorResult = { errorsMessages: [] };
        errors.forEach((e) => {
          if (e.constraints) {
            const keys = Object.keys(e.constraints);
            keys.forEach((key) => {
              errorsForResponse.errorsMessages.push({
                field: e.property,
                message: e.constraints![key],
              });
            });
          }
        });
        throw new BadRequestException(errorsForResponse.errorsMessages);
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const config = new DocumentBuilder()
    .setTitle('NestJS blog app api')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .addBasicAuth()
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const swaggerPath = '/swagger';
  SwaggerModule.setup(swaggerPath, app, document);
};
