import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { CreateBlogModel } from './models/input/blogs.input.model';
import { BlogsService } from './app/blogs.service';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { SETTINGS } from 'src/settings';
import { SearchQueryParametersType } from 'src/features/domain/query.types';

@Controller(SETTINGS.PATH.blogs)
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
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
  ) {
    return await this.blogsService.updateBlog(inputModel, id);
  }

  @Delete(':id')
  async deleteBlog(@Param('id') id: string) {
    return await this.blogsService.deleteBlog(id);
  }
}
