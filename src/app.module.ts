import { Module, RequestMethod, type MiddlewareConsumer, type NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { AuthBearerGuard } from './infrastructure/guards/auth-bearer.guards';
import { UserIdFromJWT } from './infrastructure/middlewares/userIdFromJWT.middleware';
import { BlogsModule } from './features/blogs/blogs.module';
import { AuthModule } from './features/users/auth.module';
import { UsersModule } from './features/users/users.module';
import { TestingModule } from './features/common/testing.module';
import { ConstraintsModule } from './features/common/constraints.module';
import { QuizModule } from './features/quiz/quiz.module';
import { ScheduleModule } from '@nestjs/schedule';

const modules = [
  BlogsModule,
  AuthModule,
  UsersModule,
  ConstraintsModule,
  TestingModule,
  QuizModule,
];

const options: TypeOrmModuleOptions = {
  type: 'postgres',
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'sa',
  database: 'test',
  // /logging: ['query'],
  autoLoadEntities: true,
  synchronize: true,
};
@Module({
  imports: [
    ...modules,
    CqrsModule,
    TypeOrmModule.forRoot(options),
    ScheduleModule.forRoot(),
    JwtModule.register({
      global: true,
    }),
  ],
  controllers: [],
  providers: [
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
        { path: 'blogs/*', method: RequestMethod.GET },
        { path: 'blogs', method: RequestMethod.GET },
        { path: 'comments/:id', method: RequestMethod.GET },
        { path: 'posts/*', method: RequestMethod.GET },
        { path: 'posts', method: RequestMethod.GET },
      );
  }
}
