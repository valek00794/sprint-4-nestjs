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
import { CreatePostCommand } from 'src/features/posts/app/useCases/createPost.useCase';
import { BlogsService } from '../../app/blogs.service';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query-repository';
import { CreateBlogInputModel, CreatePostForBlogModel } from '../models/input/blogs.input.model';
import { CreateBlogCommand } from '../../app/useCases/createBlog.useCase';
import { UpdateBlogCommand } from '../../app/useCases/updateBlog.useCase';
import { UpdatePostCommand } from 'src/features/posts/app/useCases/updatePost.useCase';
import { AuthBearerGuard } from 'src/infrastructure/guards/auth-bearer.guards';
import { DeleteBlogCommand } from '../../app/useCases/deleteBlog.useCase';
import { DeletePostCommand } from 'src/features/posts/app/useCases/deletePost.useCase';
import { CommentsQueryRepository } from 'src/features/comments/infrastructure/comments.query-repository';

@UseGuards(AuthBearerGuard)
@Controller(SETTINGS.PATH.blogsBlogger)
export class BlogsBloggerController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getBlogs(@Req() req: Request, @Query() query?: SearchQueryParametersType) {
    return await this.blogsQueryRepository.getBlogs(query, false, false, req.user!.userId);
  }

  @Post()
  async createBlog(@Body() inputModel: CreateBlogInputModel, @Req() req: Request) {
    const createdBlog = await this.commandBus.execute(
      new CreateBlogCommand(inputModel, req.user?.userId),
    );
    return this.blogsQueryRepository.mapToOutput(createdBlog);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Body() inputModel: CreateBlogInputModel,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    await this.commandBus.execute(new UpdateBlogCommand(inputModel, id, req.user?.userId));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string, @Req() req: Request) {
    const deleteResult = await this.commandBus.execute(new DeleteBlogCommand(id, req.user?.userId));
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
    const posts = await this.postsQueryRepository.getPosts(query, blogId, req.user?.userId, false);
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
    @Req() req: Request,
  ) {
    const createdPost = await this.commandBus.execute(
      new CreatePostCommand(inputModel, blogId, req.user?.userId),
    );
    return this.postsQueryRepository.mapToOutput(createdPost);
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Body() inputModel: CreatePostForBlogModel,
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Req() req: Request,
  ) {
    await this.commandBus.execute(
      new UpdatePostCommand(inputModel, postId, blogId, req.user?.userId),
    );
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Req() req: Request,
  ) {
    await this.commandBus.execute(new DeletePostCommand(postId, blogId, req.user?.userId));
  }

  @Get('comments')
  async getComments(@Req() req: Request, @Query() query?: SearchQueryParametersType) {
    return await this.commentsQueryRepository.getComments(undefined, query, req.user!.userId);
  }
}
