import { Module, RequestMethod, type MiddlewareConsumer, type NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';

import { SETTINGS } from './settings/settings';
import { Blog, BlogsSchema } from './features/blogs/infrastructure/blogs.schema';
import {
  User,
  UsersRecoveryPasssword,
  UsersSchema,
  usersRecoveryPassswordSchema,
} from './features/users/infrastructure/users/users.schema';
import { AuthController } from './features/users/api/auth.controller';
import { AuthBearerGuard } from './infrastructure/guards/auth-bearer.guards';
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
import { UserIdFromJWT } from './infrastructure/middlewares/apiLoggerMiddleware/userIdFromJWT.middleware';
import { BlogsModule } from './features/blogs/blogs.module';
import { AuthModule } from './features/users/auth.module';
import { UsersModule } from './features/users/users.module';
import { TestingModule } from './features/common/testing.module';
import { UsersRepository } from './features/users/infrastructure/users/users.repository';
import { BlogsQueryRepository } from './features/blogs/infrastructure/blogs.query-repository';

const modules = [BlogsModule, AuthModule, UsersModule, TestingModule];

const validationConstraints = [IsUserAlreadyExistConstraint, BlogIdExistConstraint];

@Module({
  imports: [
    ...modules,
    CqrsModule,
    MongooseModule.forRoot(SETTINGS.DB.mongoURI),
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: BlogsSchema,
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
        name: ApiRequest.name,
        schema: ApiRequestsSchema,
      },
    ]),
    JwtModule.register({
      global: true,
    }),
  ],
  controllers: [],
  providers: [
    ...validationConstraints,
    UsersRepository,
    BlogsQueryRepository,
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
        { path: 'auth/logout', method: RequestMethod.POST },
        { path: 'auth/refresh-token', method: RequestMethod.POST },
        { path: 'auth/me', method: RequestMethod.GET },
      )
      .forRoutes(AuthController)
      .apply(UserIdFromJWT)
      .forRoutes(
        { path: 'blogs/:blogId/posts', method: RequestMethod.GET },
        { path: 'comments/:id', method: RequestMethod.GET },
        { path: 'posts/*', method: RequestMethod.GET },
        { path: 'posts', method: RequestMethod.GET },
      );
  }
}
