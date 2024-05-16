import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res } from '@nestjs/common';
import { Response } from 'express';

import { CreateBlogModel } from './models/input/blogs.input.model';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { SETTINGS, StatusCodes } from 'src/settings';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { BlogsService } from '../app/blogs.service';
import { PostsQueryRepository } from 'src/features/posts/infrastructure/posts.query-repository';
import { CreatePostModel } from 'src/features/posts/api/models/input/posts.input.model';
import { PostsService } from 'src/features/posts/app/posts.service';

@Controller(SETTINGS.PATH.blogs)
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected postsService: PostsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}

  @Post()
  async createBlog(@Body() inputModel: CreateBlogModel) {
    const createdBlog = await this.blogsService.createBlog(inputModel);
    return this.blogsQueryRepository.mapToOutput(createdBlog);
  }

  @Get()
  async getBlogs(@Query() query: SearchQueryParametersType) {
    return await this.blogsQueryRepository.getBlogs(query);
  }
  @Get(':id')
  async getBlog(@Param('id') id: string) {
    return await this.blogsQueryRepository.findBlog(id);
  }

  @Put(':id')
  async updateBlog(
    @Body() inputModel: CreateBlogModel,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    await this.blogsService.updateBlog(inputModel, id);
    return res.sendStatus(StatusCodes.NO_CONTENT_204);
  }

  @Delete(':id')
  async deleteBlog(@Param('id') id: string, @Res() res: Response) {
    const deleteResult = await this.blogsService.deleteBlog(id);
    if (deleteResult) {
      return res.sendStatus(StatusCodes.NO_CONTENT_204);
    }
    return res.sendStatus(StatusCodes.NOT_FOUND_404);
  }

  @Get(':blogId/posts')
  async getPostOfBlog(
    @Query() query: SearchQueryParametersType,
    @Param('blogId') blogId: string,
    @Res() res: Response,
  ) {
    const posts = await this.postsQueryRepository.getPosts(query, blogId);
    if (!posts) {
      res.sendStatus(StatusCodes.NOT_FOUND_404);
      return;
    } else {
      res.status(StatusCodes.OK_200).send(posts);
      return;
    }
  }

  @Post(':blogId/posts')
  async createPost(
    @Body() inputModel: CreatePostModel,
    @Param('blogId') blogId: string,
    @Res() res: Response,
  ) {
    const createdPost = await this.postsService.createPost(inputModel, blogId);
    if (!createdPost) {
      res.sendStatus(StatusCodes.NOT_FOUND_404);
      return;
    } else {
      res.status(StatusCodes.CREATED_201).send(this.postsQueryRepository.mapToOutput(createdPost));
      return;
    }
  }
}
