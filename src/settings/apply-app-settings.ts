import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
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
};
