import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from 'src/features/blogs/infrastructure/blogs.schema';
import { Post, PostDocument } from 'src/features/posts/infrastructure/posts.schema';
import { User, UserDocument } from 'src/features/users/infrastructure/users/users.schema';
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
