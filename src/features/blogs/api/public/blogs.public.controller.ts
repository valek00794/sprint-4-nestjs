import {
  Controller,
  Get,
  Param,
  Query,
  HttpStatus,
  NotFoundException,
  HttpCode,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CommandBus } from '@nestjs/cqrs';

import { BlogsQueryRepository } from '../../infrastructure/blogs.query-repository';
import { SETTINGS } from 'src/settings/settings';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { BlogsService } from '../../app/blogs.service';
import { PostsQueryRepository } from 'src/features/posts/infrastructure/posts.query-repository';
import { PostsService } from 'src/features/posts/app/posts.service';
import { Public } from 'src/infrastructure/decorators/transform/public.decorator';

@Public()
@Controller(SETTINGS.PATH.blogs)
export class BlogsPublicController {
  constructor(
    protected blogsService: BlogsService,
    protected postsService: PostsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getBlogs(@Query() query?: SearchQueryParametersType) {
    return await this.blogsQueryRepository.getBlogs(query);
  }

  @Get(':id')
  async getBlog(@Param('id') id: number) {
    const blog = await this.blogsQueryRepository.findBlogById(id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return blog;
  }

  @Get(':blogId/posts')
  @HttpCode(HttpStatus.OK)
  async getPostsOfBlog(
    @Param('blogId') blogId: string,
    @Req() req: Request,
    @Query() query?: SearchQueryParametersType,
  ) {
    const posts = await this.postsQueryRepository.getPosts(query, blogId, req.user?.userId);
    if (!posts) {
      throw new NotFoundException('Blog not found');
    }
    return posts;
  }
}
