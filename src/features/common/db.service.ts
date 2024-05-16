import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from '../blogs/infrastructure/blogs.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Post, type PostDocument } from '../posts/infrastructure/posts.schema';
import { User, type UserDocument } from '../users/infrastructure/Users.schema';

@Injectable()
export class DbService {
  constructor(
    @InjectModel(Blog.name) private blogsModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postsModel: Model<PostDocument>,
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
  ) {}
  async clearDb() {
    await this.blogsModel.deleteMany({});
    await this.postsModel.deleteMany({});
    await this.usersModel.deleteMany({});
    return true;
  }
}
