import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import type { APIErrorResult } from './exception.filter.types';
import { useContainer } from 'class-validator';
import { AppModule } from 'src/app.module';

export const applyAppSettings = (app: INestApplication) => {
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
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
        throw new BadRequestException(errorsForResponse);
      },
    }),
  );
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
};
