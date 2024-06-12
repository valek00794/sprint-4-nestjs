import { Module, RequestMethod, type MiddlewareConsumer, type NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';

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
import { UsersDevicesRepository } from './features/users/infrastructure/devices/usersDevices-repository';
import { UsersDevicesService } from './features/users/app/userDevices.service';
import { AuthBearerGuard } from './infrastructure/guards/auth-bearer.guards';
import { JwtAdapter } from './infrastructure/adapters/jwt/jwt-adapter';
import { IsUserAlreadyExistConstraint } from './infrastructure/decorators/validate/user-exists.decorator';
import { BlogIdExistConstraint } from './infrastructure/decorators/validate/blogId.decorator';
import {
  ApiRequest,
  ApiRequestsSchema,
} from './infrastructure/middlewares/apiLoggerMiddleware/apiRequests.schema';
import {
  ApiRequestsCounterMiddleware,
  ApiRequestsLogMiddleware,
} from './infrastructure/middlewares/apiLoggerMiddleware/apiRequestsLog.middleware';
import { CommentsRepository } from './features/comments/infrastructure/comments.repository';
import { CommentsQueryRepository } from './features/comments/infrastructure/comments.query-repository';
import { CommentsSchema, Comment } from './features/comments/infrastructure/comments.schema';
import { LikesRepository } from './features/likes/infrastructure/likeS.repository';
import { CommentsController } from './features/comments/api/comments.controller';
import { UserIdFromJWT } from './infrastructure/middlewares/apiLoggerMiddleware/userIdFromJWT.middleware';
import { UpdateBlogUseCase } from './features/blogs/app/useCases/updateBlog.useCase';
import { CreatePostUseCase } from './features/posts/app/useCases/createPost.useCase';
import { UpdatePostUseCase } from './features/posts/app/useCases/updatePost.useCase';
import { CreateCommentUseCase } from './features/comments/app/useCases/createComment.useCase';
import { CreateBlogUseCase } from './features/blogs/app/useCases/createBlog.useCase';
import { DeleteCommentUseCase } from './features/comments/app/useCases/deleteComment.useCase';
import { UpdateCommentUseCase } from './features/comments/app/useCases/updateComment.useCase';
import { ChangeLikeStatusUseCase } from './features/likes/app/useCases/changeLikeStatus.useCase';
import { AddUserDeviceUseCase } from './features/users/app/useCases/userDevices/addUserDevice.useCase';
import { UpdateUserDeviceUseCase } from './features/users/app/useCases/userDevices/updateUserDevice.useCase';
import { SignInUseCase } from './features/users/app/useCases/auth/signIn.useCase';
import { ConfirmEmailUseCase } from './features/users/app/useCases/auth/confirmEmail.useCase';
import { ResentConfirmEmailUseCase } from './features/users/app/useCases/auth/resentConfirmEmail.useCase';
import { CheckUserByRefreshTokenUseCase } from './features/users/app/useCases/auth/checkUserByRefreshToken.useCase';
import { RenewTokensUseCase } from './features/users/app/useCases/auth/renewTokens.useCase';
import { LogoutUserUseCase } from './features/users/app/useCases/auth/logoutUser.useCase';
import { SignUpUserUseCase } from './features/users/app/useCases/users/signUpUser.useCase';
import { PasswordRecoveryUseCase } from './features/users/app/useCases/users/passwordRecovery.useCase';
import { CreateUserUseCase } from './features/users/app/useCases/users/createUser.useCase';
import { ConfirmPasswordRecoveryUseCase } from './features/users/app/useCases/users/confirmPasswordRecovery.useCase';

const postsProviders = [PostsService, PostsRepository, PostsQueryRepository];
const blogsProviders = [BlogsService, BlogsRepository, BlogsQueryRepository];
const commentsProviders = [CommentsRepository, CommentsQueryRepository];
const likesProviders = [LikesRepository, LikesQueryRepository];

const blogsUseCases = [CreateBlogUseCase, UpdateBlogUseCase];
const postsUseCases = [CreatePostUseCase, UpdatePostUseCase];
const commentsUseCases = [CreateCommentUseCase, UpdateCommentUseCase, DeleteCommentUseCase];
const likesUseCases = [ChangeLikeStatusUseCase];
const userDevicesUseCases = [AddUserDeviceUseCase, UpdateUserDeviceUseCase];
const authUseCases = [
  SignInUseCase,
  ConfirmEmailUseCase,
  ResentConfirmEmailUseCase,
  CheckUserByRefreshTokenUseCase,
  RenewTokensUseCase,
  LogoutUserUseCase,
];

const usersCases = [
  SignUpUserUseCase,
  PasswordRecoveryUseCase,
  CreateUserUseCase,
  ConfirmPasswordRecoveryUseCase,
];

const usersProviders = [
  UsersService,
  UsersRepository,
  UsersQueryRepository,
  UsersDevicesService,
  UsersDevicesRepository,
];

const validationConstraints = [IsUserAlreadyExistConstraint, BlogIdExistConstraint];

@Module({
  imports: [
    CqrsModule,
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
        name: ApiRequest.name,
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
    ...blogsUseCases,
    ...postsUseCases,
    ...commentsUseCases,
    ...likesUseCases,
    ...userDevicesUseCases,
    ...authUseCases,
    ...usersCases,
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
      .forRoutes(AuthController)
      .apply(UserIdFromJWT)
      .forRoutes(
        { path: 'blogs/:blogId/posts', method: RequestMethod.GET },
        { path: 'comments/:id', method: RequestMethod.GET },
        { path: 'posts/*', method: RequestMethod.GET },
      );
  }
}
