import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { SETTINGS } from 'src/settings/settings';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { PostsQueryRepository } from 'src/features/posts/infrastructure/posts.query-repository';
import { PostsService } from 'src/features/posts/app/posts.service';
import { AuthBasicGuard } from 'src/infrastructure/guards/auth-basic.guard';
import { BlogsService } from '../../app/blogs.service';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query-repository';
import { Public } from 'src/infrastructure/decorators/transform/public.decorator';
import { BindBlogCommand } from '../../app/useCases/bindBlog.useCase';

@Public()
@UseGuards(AuthBasicGuard)
@Controller(SETTINGS.PATH.blogsSa)
export class BlogsAdminController {
  constructor(
    protected blogsService: BlogsService,
    protected postsService: PostsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getBlogs(@Query() query?: SearchQueryParametersType) {
    return await this.blogsQueryRepository.getBlogs(query, true);
  }

  @Put(':id/bind-with-user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async bindBlog(@Param('id') id: string, @Param('userId') userId: string) {
    await this.commandBus.execute(new BindBlogCommand(id, userId));
  }
}
