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

import { BlogsQueryRepository } from '../../infrastructure/blogs.query-repository';
import { SETTINGS } from 'src/settings/settings';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { BlogsService } from '../../app/blogs.service';
import { PostsQueryRepository } from 'src/features/posts/infrastructure/posts.query-repository';
import { PostsService } from 'src/features/posts/app/posts.service';
import { Public } from 'src/infrastructure/decorators/transform/public.decorator';
import { GetBlogImagesQuery } from '../../app/useCases/queryBus/getBlogImages.useCase';
import { QueryBus } from '@nestjs/cqrs';
import { GetBlogsQuery } from '../../app/useCases/queryBus/getBlogs.useCase';
import { GetPostsQuery } from '../../../posts/app/useCases/queryBus/getPosts.useCase';

@Public()
@Controller(SETTINGS.PATH.blogs)
export class BlogsPublicController {
  constructor(
    protected blogsService: BlogsService,
    protected postsService: PostsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
    private queryBus: QueryBus,
  ) {}

  @Get()
  async getBlogs(@Query() query?: SearchQueryParametersType) {
    return await this.queryBus.execute(new GetBlogsQuery(query, false, true));
  }

  @Get(':id')
  async getBlog(@Param('id') id: string) {
    const blog = await this.blogsQueryRepository.findUnbannedBlogById(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    const images = await this.queryBus.execute(new GetBlogImagesQuery(blog.id));
    return { ...blog, images };
  }

  @Get(':blogId/posts')
  @HttpCode(HttpStatus.OK)
  async getPostsOfBlog(
    @Param('blogId') blogId: string,
    @Req() req: Request,
    @Query() query?: SearchQueryParametersType,
  ) {
    return await this.queryBus.execute(new GetPostsQuery(query, blogId, req.user?.userId, true));
  }
}
