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
import { AuthBearerGuard } from './infrastructure/guards/auth-bearer.guards';
import { IsUserAlreadyExistConstraint } from './infrastructure/decorators/validate/user-exists.decorator';
import { BlogIdExistConstraint } from './infrastructure/decorators/validate/blogId.decorator';
import { UserIdFromJWT } from './infrastructure/middlewares/userIdFromJWT.middleware';
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
      .apply(UserIdFromJWT)
      .forRoutes(
        { path: 'blogs/:blogId/posts', method: RequestMethod.GET },
        { path: 'comments/:id', method: RequestMethod.GET },
        { path: 'posts/*', method: RequestMethod.GET },
        { path: 'posts', method: RequestMethod.GET },
      );
  }
}
