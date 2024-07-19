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

import { SETTINGS } from 'src/settings/settings';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { PostsQueryRepository } from 'src/features/posts/infrastructure/posts.query-repository';
import { PostsService } from 'src/features/posts/app/posts.service';
import { AuthBasicGuard } from 'src/infrastructure/guards/auth-basic.guard';
import { CreatePostCommand } from 'src/features/posts/app/useCases/createPost.useCase';
import { BlogsService } from '../../app/blogs.service';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query-repository';
import { CreateBlogInputModel, CreatePostForBlogModel } from '../models/input/blogs.input.model';
import { CreateBlogCommand } from '../../app/useCases/createBlog.useCase';
import { UpdateBlogCommand } from '../../app/useCases/updateBlog.useCase';
import { UpdatePostCommand } from 'src/features/posts/app/useCases/updatePost.useCase';
import { Public } from 'src/infrastructure/decorators/transform/public.decorator';

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
    return await this.blogsQueryRepository.getBlogs(query);
  }

  @Post()
  async createBlog(@Body() inputModel: CreateBlogInputModel) {
    const createdBlog = await this.commandBus.execute(new CreateBlogCommand(inputModel));
    return this.blogsQueryRepository.mapToOutput(createdBlog);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Body() inputModel: CreateBlogInputModel, @Param('id') id: string) {
    await this.commandBus.execute(new UpdateBlogCommand(inputModel, id));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string) {
    const deleteResult = await this.blogsService.deleteBlog(id);
    if (!deleteResult) {
      throw new NotFoundException('Blog not found');
    }
    return deleteResult;
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

  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostForBlog(
    @Body() inputModel: CreatePostForBlogModel,
    @Param('blogId') blogId: string,
  ) {
    const createdPost = await this.commandBus.execute(new CreatePostCommand(inputModel, blogId));
    return this.postsQueryRepository.mapToOutput(createdPost);
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Body() inputModel: CreatePostForBlogModel,
    @Param('blogId') blogId: number,
    @Param('postId') postId: string,
  ) {
    await this.commandBus.execute(new UpdatePostCommand(inputModel, postId, blogId));
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('blogId') blogId: number, @Param('postId') postId: string) {
    const blog = await this.blogsQueryRepository.findBlogById(blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    const deleteResult = await this.postsService.deletePost(postId);
    if (!deleteResult) {
      throw new NotFoundException('Post not found');
    }
  }
}
