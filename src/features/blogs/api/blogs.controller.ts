import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  HttpStatus,
  UseGuards,
  NotFoundException,
  HttpCode,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CommandBus } from '@nestjs/cqrs';

import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { SETTINGS } from 'src/settings/settings';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { BlogsService } from '../app/blogs.service';
import { PostsQueryRepository } from 'src/features/posts/infrastructure/posts.query-repository';
import { PostsService } from 'src/features/posts/app/posts.service';
import { Public } from 'src/infrastructure/decorators/transform/public.decorator';
import { AuthBasicGuard } from 'src/infrastructure/guards/auth-basic.guard';
import { CreateBlogInputModel, CreatePostForBlogModel } from './models/input/blogs.input.model';
import { UpdateBlogCommand } from '../app/useCases/updateBlog.useCase';
import { CreatePostCommand } from 'src/features/posts/app/useCases/createPost.useCase';
import { CreateBlogCommand } from '../app/useCases/createBlog.useCase';

@Public()
@Controller(SETTINGS.PATH.blogs)
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected postsService: PostsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(AuthBasicGuard)
  @Post()
  async createBlog(@Body() inputModel: CreateBlogInputModel) {
    const createdBlog = await this.commandBus.execute(new CreateBlogCommand(inputModel));
    return this.blogsQueryRepository.mapToOutput(createdBlog);
  }

  @Get()
  async getBlogs(@Query() query?: SearchQueryParametersType) {
    return await this.blogsQueryRepository.getBlogs(query);
  }

  @Get(':id')
  async getBlog(@Param('id') id: string) {
    const blog = await this.blogsQueryRepository.findBlog(id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return blog;
  }

  @UseGuards(AuthBasicGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Body() inputModel: CreateBlogInputModel, @Param('id') id: string) {
    await this.commandBus.execute(new UpdateBlogCommand(inputModel, id));
  }

  @UseGuards(AuthBasicGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string) {
    const deleteResult = await this.blogsService.deleteBlog(id);
    if (!deleteResult) {
      throw new NotFoundException('Blog not found');
    }
  }

  @Get(':blogId/posts')
  @HttpCode(HttpStatus.OK)
  async getPostOfBlog(
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

  @UseGuards(AuthBasicGuard)
  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostForBlog(
    @Body() inputModel: CreatePostForBlogModel,
    @Param('blogId') blogId: string,
  ) {
    const blog = await this.blogsQueryRepository.findBlog(blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    const createdPost = await this.commandBus.execute(new CreatePostCommand(inputModel, blogId));
    return this.postsQueryRepository.mapToOutput(createdPost);
  }
}
