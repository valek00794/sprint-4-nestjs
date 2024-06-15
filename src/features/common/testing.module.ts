import { Module } from '@nestjs/common';
import { ClearDbController } from './api/clear-db.controller';
import { DbService } from './app/db.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogsSchema } from '../blogs/infrastructure/blogs.schema';
import { Post, PostsSchema } from '../posts/infrastructure/posts.schema';
import {
  User,
  UserEmailConfirmationInfo,
  UserEmailConfirmationInfoSchema,
  UsersRecoveryPasssword,
  UsersSchema,
  usersRecoveryPassswordSchema,
} from '../users/infrastructure/users/users.schema';
import {
  UsersDevices,
  UsersDevicesSchema,
} from '../users/infrastructure/devices/usersDevices.schema';
import { CommentsSchema, Comment } from '../comments/infrastructure/comments.schema';
import { Like, LikeSchema } from '../likes/infrastructure/likes.schema';
import {
  ApiRequest,
  ApiRequestsSchema,
} from 'src/infrastructure/middlewares/apiLoggerMiddleware/apiRequests.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: BlogsSchema,
      },
      {
        name: Post.name,
        schema: PostsSchema,
      },
      {
        name: User.name,
        schema: UsersSchema,
      },
      {
        name: UsersRecoveryPasssword.name,
        schema: usersRecoveryPassswordSchema,
      },
      {
        name: UserEmailConfirmationInfo.name,
        schema: UserEmailConfirmationInfoSchema,
      },
      {
        name: UsersDevices.name,
        schema: UsersDevicesSchema,
      },
      {
        name: Comment.name,
        schema: CommentsSchema,
      },
      {
        name: Like.name,
        schema: LikeSchema,
      },
      {
        name: ApiRequest.name,
        schema: ApiRequestsSchema,
      },
    ]),
  ],
  controllers: [ClearDbController],
  providers: [DbService],
})
export class TestingModule {}
