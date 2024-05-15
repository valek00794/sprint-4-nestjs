import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { SETTINGS } from 'src/settings';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { CreatePostModel } from './models/input/posts.input.model';
import { PostsService } from './app/posts.service';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';

@Controller(SETTINGS.PATH.posts)
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}

  @Post()
  async createPost(@Body() inputModel: CreatePostModel) {
    const createdPost = await this.postsService.createPost(inputModel);
    return this.postsQueryRepository.mapToOutput(createdPost);
  }

  async createPostForBlog(@Body() inputModel: CreatePostModel, @Param('blogId') blogId: string) {
    const createdPost = await this.postsService.createPost(inputModel, blogId);
    return this.postsQueryRepository.mapToOutput(createdPost);
  }

  @Get()
  async getPosts(@Query() query: SearchQueryParametersType) {
    return await this.postsQueryRepository.getPosts(query);
  }
  @Get(':id')
  async getPost(@Param('id') id: string) {
    return await this.postsQueryRepository.findPost(id);
  }

  @Put(':id')
  async updatePost(@Body() inputModel: CreatePostModel, @Param('id') id: string) {
    return await this.postsService.updatePost(inputModel, id);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    return await this.postsService.deletePost(id);
  }
}
