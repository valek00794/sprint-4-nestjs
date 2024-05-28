import type { INestApplication } from '@nestjs/common';

export const applyAppSettings = (app: INestApplication) => {
  app.enableCors();
};
