import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BlogsController } from './features/blogs/api/blogs.controller';
import { BlogsRepository } from './features/blogs/infrastructure/blogs.repository';
import { SETTINGS } from './settings/settings';
import { BlogsQueryRepository } from './features/blogs/infrastructure/blogs.query-repository';
import { Blog, BlogsSchema } from './features/blogs/infrastructure/blogs.schema';
import { PostsController } from './features/posts/api/posts.controller';
import { PostsRepository } from './features/posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './features/posts/infrastructure/posts.query-repository';
import { Post, PostsSchema } from './features/posts/infrastructure/posts.schema';
import { BlogsService } from './features/blogs/app/blogs.service';
import { PostsService } from './features/posts/app/posts.service';
import { UsersController } from './features/users/api/users.controller';
import { UsersService } from './features/users/app/users.service';

import {
  User,
  UserEmailConfirmationInfo,
  UserEmailConfirmationInfoSchema,
  UsersRecoveryPasssword,
  UsersSchema,
  usersRecoveryPassswordSchema,
} from './features/users/infrastructure/users/users.schema';
import { UsersRepository } from './features/users/infrastructure/users/users.repository';
import { UsersQueryRepository } from './features/users/infrastructure/users/users.query-repository';
import { LikesQueryRepository } from './features/likes/infrastructure/likeStatus.query-repository';
import { Like, LikeSchema } from './features/likes/infrastructure/likeStatus.schema';
import { ClearDbController } from './features/common/api/clear-db.controller';
import { DbService } from './features/common/app/db.service';
import {
  UsersDevices,
  UsersDevicesSchema,
} from './features/users/infrastructure/devices/usersDevices.schema';

const postsProviders = [PostsService, PostsRepository, PostsQueryRepository];
const blogsProviders = [BlogsService, BlogsRepository, BlogsQueryRepository];
const usersProviders = [UsersService, UsersRepository, UsersQueryRepository];
@Module({
  imports: [
    MongooseModule.forRoot(SETTINGS.DB.mongoURI),
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
        name: Like.name,
        schema: LikeSchema,
      },
    ]),
  ],
  controllers: [BlogsController, ClearDbController, PostsController, UsersController],
  providers: [
    ...postsProviders,
    ...blogsProviders,
    ...usersProviders,
    DbService,
    LikesQueryRepository,
  ],
})
export class AppModule {}
