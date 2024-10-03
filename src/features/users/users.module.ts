import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersAdminController } from './api/admin/users.admin.controller';
import { UsersRepository } from './infrastructure/users/users.repository';
import { UsersService } from './app/users.service';
import { UsersQueryRepository } from './infrastructure/users/users.query-repository';
import { CreateUserUseCase } from './app/useCases/users/createUser.useCase';
import { JwtAdapter } from 'src/infrastructure/adapters/jwt/jwt-adapter';
import { User } from './infrastructure/users/users.entity';
import { UserEmailConfirmationInfo } from './infrastructure/users/usersEmailConfirmationInfo.entity';
import { UsersRecoveryPasssword } from './infrastructure/users/UsersRecoveryPasssword.entity ';
import { ChangeUserBanStatusUseCase } from './app/useCases/banInfo/changeUserBanStatus.useCase';
import { UsersDevicesRepository } from './infrastructure/devices/usersDevices-repository';
import { UsersDevices } from './infrastructure/devices/usersDevices.entity';
import { UsersBanInfo } from './infrastructure/banInfo/usersBanInfo.entity';
import { BanInfoRepository } from './infrastructure/banInfo/banInfo.repository';
import { ChangeUserBanStatusForBlogsUseCase } from './app/useCases/banInfo/changeUserBanStatusForBlogs.useCase';
import { UsersBanInfoForBlogs } from './infrastructure/banInfo/usersBanInfoForBlogs.entity';
import { UsersBloggerController } from './api/blogger/users.blogger.controller';
import { Blog } from '../blogs/infrastructure/blogs.entity';
import { GetBannedUsersForBlogUseCase } from './app/useCases/banInfo/getBannedUsersForBlog.useCase';
import { BlogsRepository } from '../blogs/infrastructure/blogs.repository';
import { BanInfoQueryRepository } from './infrastructure/banInfo/banInfo.query-repository';

const usersUseCases = [
  CreateUserUseCase,
  ChangeUserBanStatusUseCase,
  ChangeUserBanStatusForBlogsUseCase,
  GetBannedUsersForBlogUseCase,
];

const usersProviders = [
  UsersService,
  UsersRepository,
  UsersQueryRepository,
  UsersDevicesRepository,
  BanInfoRepository,
  BanInfoQueryRepository,
  BlogsRepository,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      User,
      UserEmailConfirmationInfo,
      UsersRecoveryPasssword,
      UsersDevices,
      UsersBanInfo,
      UsersBanInfoForBlogs,
      Blog,
    ]),
  ],
  controllers: [UsersAdminController, UsersBloggerController],
  providers: [JwtAdapter, ...usersProviders, ...usersUseCases],
})
export class UsersModule {}
