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

import { SETTINGS } from 'src/settings/settings';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { CreatePostModel } from './models/input/posts.input.model';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { PostsService } from '../app/posts.service';
import { Public } from 'src/features/users/domain/decorators/public.decorator';
import { AuthBasicGuard } from 'src/infrastructure/guards/auth-basic.guard';
@Public()
@Controller(SETTINGS.PATH.posts)
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}
  @UseGuards(AuthBasicGuard)
  @Post()
  async createPost(@Body() inputModel: CreatePostModel) {
    const createdPost = await this.postsService.createPost(inputModel);
    return this.postsQueryRepository.mapToOutput(createdPost);
  }

  @Get()
  async getPosts(@Query() query: SearchQueryParametersType) {
    return await this.postsQueryRepository.getPosts(query);
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    const post = await this.postsQueryRepository.findPost(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  @UseGuards(AuthBasicGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(@Body() inputModel: CreatePostModel, @Param('id') id: string) {
    await this.postsService.updatePost(inputModel, id);
  }

  @UseGuards(AuthBasicGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string) {
    const deleteResult = await this.postsService.deletePost(id);
    if (!deleteResult) {
      throw new NotFoundException('Post not found');
    }
  }
}
