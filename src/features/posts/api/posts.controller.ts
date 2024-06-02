import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

import { SETTINGS } from 'src/settings/settings';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { CreatePostModel } from './models/input/posts.input.model';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { PostsService } from '../app/posts.service';

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

  @Get()
  async getPosts(@Query() query: SearchQueryParametersType) {
    return await this.postsQueryRepository.getPosts(query);
  }
  @Get(':id')
  async getPost(@Param('id') id: string) {
    return await this.postsQueryRepository.findPost(id);
  }

  @Put(':id')
  async updatePost(
    @Body() inputModel: CreatePostModel,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    await this.postsService.updatePost(inputModel, id);
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string, @Res() res: Response) {
    const deleteResult = await this.postsService.deletePost(id);
    console.log(deleteResult);
    if (deleteResult) {
      return res.sendStatus(HttpStatus.NO_CONTENT);
    }
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }
}
