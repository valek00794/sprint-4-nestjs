import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { CreateBlogModel } from '../models/input/blogs.input.model';
import { Blog, BlogDocument } from '../../infrastructure/blogs-schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class BlogsService {
  constructor(
    protected blogsRepository: BlogsRepository,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  ) {}

  async createBlog(inputModel: CreateBlogModel) {
    const newBlog = new this.blogModel({
      name: inputModel.name,
      description: inputModel.description,
      websiteUrl: inputModel.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    });
    return await this.blogsRepository.createBlog(newBlog);
  }
  async updateBlog(inputModel: CreateBlogModel, id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid ID');
    }
    const blog = await this.blogsRepository.findBlog(id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    const updatedblog = {
      name: inputModel.name,
      description: inputModel.description,
      websiteUrl: inputModel.websiteUrl,
      createdAt: blog!.createdAt,
      isMembership: false,
    };
    return await this.blogsRepository.updateBlog(updatedblog, id);
  }
  async deleteBlog(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid ID');
    }
    return await this.blogsRepository.deleteBlog(id);
  }
}
