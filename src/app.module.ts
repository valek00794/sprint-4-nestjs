import { Module, RequestMethod, type MiddlewareConsumer, type NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

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
import { LikesQueryRepository } from './features/likes/infrastructure/likes.query-repository';
import { Like, LikeSchema } from './features/likes/infrastructure/likes.schema';
import { ClearDbController } from './features/common/api/clear-db.controller';
import { DbService } from './features/common/app/db.service';
import {
  UsersDevices,
  UsersDevicesSchema,
} from './features/users/infrastructure/devices/usersDevices.schema';
import { AuthController } from './features/users/api/auth.controller';
import { AuthService } from './features/users/app/auth.service';
import { UsersDevicesRepository } from './features/users/infrastructure/devices/usersDevices-repository';
import { UsersDevicesService } from './features/users/app/userDevices.service';
import { AuthBearerGuard } from './infrastructure/guards/auth-bearer.guards';
import { JwtAdapter } from './infrastructure/adapters/jwt/jwt-adapter';
import { IsUserAlreadyExistConstraint } from './infrastructure/decorators/user-exists.decorator';
import { BlogIdExistConstraint } from './infrastructure/decorators/blogId.validation.decorator';
import {
  ApiRequests,
  ApiRequestsSchema,
} from './infrastructure/middlewares/apiLoggerMiddleware/apiRequests.schema';
import {
  ApiRequestsCounterMiddleware,
  ApiRequestsLogMiddleware,
} from './infrastructure/middlewares/apiLoggerMiddleware/apiRequestsLog.middleware';
import { CommentsService } from './features/comments/app/comments.service';
import { CommentsRepository } from './features/comments/infrastructure/comments.repository';
import { CommentsQueryRepository } from './features/comments/infrastructure/comments.query-repository';
import { CommentsSchema, Comment } from './features/comments/infrastructure/comments.schema';
import { LikesRepository } from './features/likes/infrastructure/likeS.repository';
import { LikesService } from './features/likes/app/likes.service';
import { CommentsController } from './features/comments/api/comments.controller';

const postsProviders = [PostsService, PostsRepository, PostsQueryRepository];
const blogsProviders = [BlogsService, BlogsRepository, BlogsQueryRepository];
const commentsProviders = [CommentsService, CommentsRepository, CommentsQueryRepository];
const likesProviders = [LikesService, LikesRepository, LikesQueryRepository];

const usersProviders = [
  UsersService,
  UsersRepository,
  UsersQueryRepository,
  AuthService,
  UsersDevicesService,
  UsersDevicesRepository,
];

const validationConstraints = [IsUserAlreadyExistConstraint, BlogIdExistConstraint];
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
        name: Comment.name,
        schema: CommentsSchema,
      },
      {
        name: Like.name,
        schema: LikeSchema,
      },
      {
        name: ApiRequests.name,
        schema: ApiRequestsSchema,
      },
    ]),
    JwtModule.register({
      global: true,
    }),
  ],
  controllers: [
    BlogsController,
    ClearDbController,
    PostsController,
    UsersController,
    AuthController,
    CommentsController,
  ],
  providers: [
    ...postsProviders,
    ...blogsProviders,
    ...usersProviders,
    ...commentsProviders,
    ...likesProviders,
    ...validationConstraints,
    DbService,
    JwtAdapter,
    {
      provide: APP_GUARD,
      useClass: AuthBearerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiRequestsLogMiddleware, ApiRequestsCounterMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/me', method: RequestMethod.GET },
      )
      .forRoutes(AuthController);
  }
}
