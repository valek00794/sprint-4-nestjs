import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from 'src/features/blogs/infrastructure/blogs.schema';
import { Post, PostDocument } from 'src/features/posts/infrastructure/posts.schema';
import {
  User,
  UserDocument,
  UsersRecoveryPassswordDocument,
  UsersRecoveryPasssword,
} from 'src/features/users/infrastructure/users/users.schema';
import {
  UsersDevices,
  UsersDevicesDocument,
} from 'src/features/users/infrastructure/devices/usersDevices.schema';
import { Comment, CommentDocument } from 'src/features/comments/infrastructure/comments.schema';
import { Like, LikeDocument } from 'src/features/likes/infrastructure/likes.schema';
import {
  ApiRequest,
  ApiRequestDocument,
} from 'src/infrastructure/middlewares/apiLoggerMiddleware/apiRequests.schema';
@Injectable()
export class DbService {
  constructor(
    @InjectModel(Blog.name) private BlogsModel: Model<BlogDocument>,
    @InjectModel(Post.name) private PostsModel: Model<PostDocument>,
    @InjectModel(User.name) private UsersModel: Model<UserDocument>,
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
    @InjectModel(Like.name) private LikeModel: Model<LikeDocument>,
    @InjectModel(UsersRecoveryPasssword.name)
    private UsersRecoveryPassswordModel: Model<UsersRecoveryPassswordDocument>,
    @InjectModel(UsersDevices.name) private UsersDevicesModel: Model<UsersDevicesDocument>,
    @InjectModel(ApiRequest.name) private ApiRequestModel: Model<ApiRequestDocument>,
  ) {}
  async clearDb() {
    await this.BlogsModel.deleteMany({});
    await this.PostsModel.deleteMany({});
    await this.UsersModel.deleteMany({});
    await this.CommentModel.deleteMany({});
    await this.LikeModel.deleteMany({});
    await this.UsersDevicesModel.deleteMany({});
    await this.UsersRecoveryPassswordModel.deleteMany({});
    await this.ApiRequestModel.deleteMany({});
    return true;
  }
}
