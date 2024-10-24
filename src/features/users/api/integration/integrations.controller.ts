import { Controller, Get, Req, HttpStatus, UseGuards, HttpCode, Post, Body } from '@nestjs/common';
import { Request } from 'express';
import { CommandBus } from '@nestjs/cqrs';

import { SETTINGS } from 'src/settings/settings';
import { AuthBearerGuard } from 'src/infrastructure/guards/auth-bearer.guards';
import { GetAuthBotLinkCommand } from '../../app/useCases/integrations/getAuthBotLink.useCase';
import { Public } from 'src/infrastructure/decorators/transform/public.decorator';
import { TelegramPyloadType } from 'src/infrastructure/adapters/telegram/telegram.adapter';
import { HandleTelegramUpdatesCommand } from 'src/infrastructure/adapters/telegram/useCases/handle-telegram-updates.userCase';

@Public()
@Controller(SETTINGS.PATH.integrations)
export class IntegrationsController {
  constructor(private commandBus: CommandBus) {}

  @Get('/telegram/auth-bot-link')
  @UseGuards(AuthBearerGuard)
  @HttpCode(HttpStatus.OK)
  async getAuthBotLink(@Req() req: Request) {
    return await this.commandBus.execute(new GetAuthBotLinkCommand(req.user?.userId));
  }

  @Post(SETTINGS.PATH.telegramWebHook)
  @HttpCode(HttpStatus.NO_CONTENT)
  async webhook(@Body() payload: TelegramPyloadType) {
    return await this.commandBus.execute(new HandleTelegramUpdatesCommand(payload));
  }
}
