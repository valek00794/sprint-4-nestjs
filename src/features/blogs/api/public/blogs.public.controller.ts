import {
  Controller,
  Get,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  Req,
  Post,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { BlogsQueryRepository } from '../../infrastructure/blogs.query-repository';
import { SETTINGS } from 'src/settings/settings';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { Public } from 'src/infrastructure/decorators/transform/public.decorator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetBlogsQuery } from '../../app/useCases/queryBus/getBlogs.useCase';
import { GetPostsQuery } from '../../../posts/app/useCases/queryBus/getPosts.useCase';
import { SubscribeToBlogCommand } from '../../app/useCases/commandBus/subscribeToBlog.useCase';
import { DeleteSubscriptionCommand } from '../../app/useCases/commandBus/deleteSubscription.useCase';
import { AuthBearerGuard } from 'src/infrastructure/guards/auth-bearer.guards';
import { GetBlogQuery } from '../../app/useCases/queryBus/getBlog.useCase';

@UseGuards(AuthBearerGuard)
@Controller(SETTINGS.PATH.blogs)
export class BlogsPublicController {
  constructor(
    protected blogsQueryRepository: BlogsQueryRepository,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}
  @Public()
  @Get()
  async getBlogs(@Req() req: Request, @Query() query?: SearchQueryParametersType) {
    return await this.queryBus.execute(new GetBlogsQuery(query, true, undefined, req.user?.userId));
  }
  @Public()
  @Get(':id')
  async getBlog(@Param('id') id: string, @Req() req: Request) {
    return await this.queryBus.execute(new GetBlogQuery(id, req.user?.userId));
  }
  @Public()
  @Get(':blogId/posts')
  @HttpCode(HttpStatus.OK)
  async getPostsOfBlog(
    @Param('blogId') blogId: string,
    @Req() req: Request,
    @Query() query?: SearchQueryParametersType,
  ) {
    return await this.queryBus.execute(new GetPostsQuery(query, blogId, req.user?.userId, true));
  }

  @Post(':blogId/subscription')
  @HttpCode(HttpStatus.NO_CONTENT)
  async subscribeToBlog(@Param('blogId') blogId: string, @Req() req: Request) {
    return await this.commandBus.execute(new SubscribeToBlogCommand(blogId, req.user!.userId));
  }

  @Delete(':blogId/subscription')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSubscription(@Param('blogId') blogId: string, @Req() req: Request) {
    return await this.commandBus.execute(new DeleteSubscriptionCommand(blogId, req.user!.userId));
  }
}
