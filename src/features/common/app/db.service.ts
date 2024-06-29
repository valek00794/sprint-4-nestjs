import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

import { Blog, BlogDocument } from 'src/features/blogs/infrastructure/blogs.schema';
import { Post, PostDocument } from 'src/features/posts/infrastructure/posts.schema';
import { Comment, CommentDocument } from 'src/features/comments/infrastructure/comments.schema';
import { Like, LikeDocument } from 'src/features/likes/infrastructure/likes.schema';

@Injectable()
export class DbService {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(Blog.name) private BlogsModel: Model<BlogDocument>,
    @InjectModel(Post.name) private PostsModel: Model<PostDocument>,
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
    @InjectModel(Like.name) private LikeModel: Model<LikeDocument>,
  ) {}
  async clearDb() {
    await this.BlogsModel.deleteMany({});
    await this.PostsModel.deleteMany({});
    await this.CommentModel.deleteMany({});
    await this.LikeModel.deleteMany({});
    const query = `
      DELETE FROM "users";
      DELETE FROM "emailConfirmations";
      DELETE FROM "usersRecoveryPassword";
      DELETE FROM "usersDevices";
    `;
    await this.dataSource.query(query);
    return true;
  }
}
