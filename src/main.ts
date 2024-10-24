import { NestFactory } from '@nestjs/core';
import ngrok from 'ngrok';

import { AppModule } from './app.module';
import { SETTINGS } from './settings/settings';
import { applyAppSettings } from './settings/apply-app-settings';
import { TelegramAdapter } from './infrastructure/adapters/telegram/telegram.adapter';

async function connctToNgrok(port: number) {
  return await ngrok.connect(port);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  applyAppSettings(app);
  await app.listen(SETTINGS.PORT, SETTINGS.BASE_APP_URL, () => {
    console.log('App listen port: ', `${SETTINGS.BASE_APP_URL}:${SETTINGS.PORT}`);
  });
  const telegramAdapter = await app.resolve(TelegramAdapter);

  const url = await connctToNgrok(Number(SETTINGS.PORT));
  const urlForTgWebhook = url + SETTINGS.PATH.integrations + SETTINGS.PATH.telegramWebHook;
  console.log(urlForTgWebhook);
  await telegramAdapter.setWebhook(urlForTgWebhook);
}
bootstrap();
