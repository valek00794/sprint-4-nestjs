import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { SETTINGS } from 'src/settings/settings';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { AuthBasicGuard } from 'src/infrastructure/guards/auth-basic.guard';
import { Public } from 'src/infrastructure/decorators/transform/public.decorator';
import { ChangeBanStatusForBlogInputModel } from '../models/input/blogs.input.model';
import { BanBlogCommand } from '../../app/useCases/commandBus/banBlog.useCase';
import { BindBlogCommand } from '../../app/useCases/commandBus/bindBlog.useCase';
import { GetBlogsByAdminQuery } from '../../app/useCases/queryBus/getBlogsByAdmin.useCase';
import { GetBlogsSwagger } from '../swagger/admin/get-blogs.swagger';
import { BindBlogWithUserSwagger } from '../swagger/admin/bind-blog-with-user.swagger';
import { BanBlogSwagger } from '../swagger/admin/ban-blog.swagger';

@Public()
@UseGuards(AuthBasicGuard)
@Controller(SETTINGS.PATH.blogsSa)
export class BlogsAdminController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  @GetBlogsSwagger()
  async getBlogs(@Query() query?: SearchQueryParametersType) {
    return await this.queryBus.execute(new GetBlogsByAdminQuery(query));
  }

  @Put(':id/bind-with-user/:userId')
  @BindBlogWithUserSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  async bindBlog(@Param('id') id: string, @Param('userId') userId: string) {
    await this.commandBus.execute(new BindBlogCommand(id, userId));
  }

  @Put(':id/ban')
  @BanBlogSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeBlogBanStatus(
    @Param('id') id: string,
    @Body() inputModel: ChangeBanStatusForBlogInputModel,
  ) {
    await this.commandBus.execute(new BanBlogCommand(id, inputModel));
  }
}
