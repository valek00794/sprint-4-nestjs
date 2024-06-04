import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SETTINGS } from './settings/settings';
import { applyAppSettings } from './settings/apply-app-settings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  applyAppSettings(app);
  await app.listen(SETTINGS.PORT, () => {
    console.log('App listen port: ', SETTINGS.PORT);
  });
}
bootstrap();
