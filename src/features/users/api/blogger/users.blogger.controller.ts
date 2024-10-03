import {
  Body,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  Put,
  Req,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Request } from 'express';

import { SETTINGS } from 'src/settings/settings';
import { SearchQueryParametersType } from 'src/features/domain/query.types';

import { ChangeUserBanStatusForBloggerInputModel } from '../models/input/users.input.models';
import { AuthBearerGuard } from 'src/infrastructure/guards/auth-bearer.guards';
import { ChangeUserBanStatusForBlogsCommand } from '../../app/useCases/banInfo/changeUserBanStatusForBlogs.useCase';
import { UsersQueryRepository } from '../../infrastructure/users/users.query-repository';
import { GetBannedUsersForBlogCommand } from '../../app/useCases/banInfo/getBannedUsersForBlog.useCase';
import { BanInfoQueryRepository } from '../../infrastructure/banInfo/banInfo.query-repository';

@UseGuards(AuthBearerGuard)
@Controller(SETTINGS.PATH.usersBlogger)
export class UsersBloggerController {
  constructor(
    private commandBus: CommandBus,
    protected usersQueryRepository: UsersQueryRepository,
    protected usersBanInfoQueryRepository: BanInfoQueryRepository,
  ) {}

  @Get('blog/:id')
  async gerBannedUsers(
    @Param('id') id: string,
    @Query() query: SearchQueryParametersType,
    @Req() req: Request,
  ) {
    return await this.commandBus.execute(
      new GetBannedUsersForBlogCommand(id, query, req.user?.userId),
    );
  }

  @Put(':id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeUserBanStatus(
    @Param('id') id: string,
    @Body() inputModel: ChangeUserBanStatusForBloggerInputModel,
    @Req() req: Request,
  ) {
    await this.commandBus.execute(
      new ChangeUserBanStatusForBlogsCommand(id, inputModel, req.user?.userId),
    );
  }
}
