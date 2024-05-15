import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from '../blogs/infrastructure/blogs-schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class DbService {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}
  async clearDb() {
    return await this.blogModel.deleteMany({});
  }
}
