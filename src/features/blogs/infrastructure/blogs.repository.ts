import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './blogs-schema';
import { Model } from 'mongoose';
import { CreateBlogModel } from '../api/models/input/blogs.input.model';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async createBlog(newBlog: CreateBlogModel) {
    const blog = new this.blogModel(newBlog);
    await blog.save();
    return blog;
  }
  async findBlog(id: string): Promise<BlogDocument | null> {
    return await this.blogModel.findById(id);
  }
  async updateBlog(updatedBlog: Blog, id: string): Promise<boolean> {
    const updatedResult = await this.blogModel.findByIdAndUpdate(id, updatedBlog, {
      new: true,
    });
    return updatedResult ? true : false;
  }
  async deleteBlog(id: string): Promise<boolean> {
    const deleteResult = await this.blogModel.findByIdAndDelete(id);
    return deleteResult ? true : false;
  }
}
