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
} from '@nestjs/common';

import {
  CreateBlogInputModel,
  type CreatePostForBlogModel,
} from './models/input/blogs.input.model';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { SETTINGS } from 'src/settings/settings';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { BlogsService } from '../app/blogs.service';
import { PostsQueryRepository } from 'src/features/posts/infrastructure/posts.query-repository';

import { PostsService } from 'src/features/posts/app/posts.service';
import { Public } from 'src/infrastructure/decorators/public.decorator';
import { AuthBasicGuard } from 'src/infrastructure/guards/auth-basic.guard';
@Public()
@Controller(SETTINGS.PATH.blogs)
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected postsService: PostsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}

  @UseGuards(AuthBasicGuard)
  @Post()
  async createBlog(@Body() inputModel: CreateBlogInputModel) {
    const createdBlog = await this.blogsService.createBlog(inputModel);
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
    await this.blogsService.updateBlog(inputModel, id);
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
  async getPostOfBlog(@Query() query: SearchQueryParametersType, @Param('blogId') blogId: string) {
    const posts = await this.postsQueryRepository.getPosts(query, blogId);
    if (!posts) {
      throw new NotFoundException('Blog not found');
    }
    return posts;
  }

  @UseGuards(AuthBasicGuard)
  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body() inputModel: CreatePostForBlogModel, @Param('blogId') blogId: string) {
    const blog = await this.blogsQueryRepository.findBlog(blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    const createdPost = await this.postsService.createPost(inputModel, blogId);
    return this.postsQueryRepository.mapToOutput(createdPost);
  }
}
