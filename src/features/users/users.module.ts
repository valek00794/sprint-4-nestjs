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
import { ChangeUserBanStatusUseCase } from './app/useCases/usersBanInfo/changeUserBanStatus.useCase';
import { UsersDevicesRepository } from './infrastructure/devices/usersDevices-repository';
import { UsersDevices } from './infrastructure/devices/usersDevices.entity';
import { UsersBanInfo } from './infrastructure/users/usersBanInfo.entity';
import { UsersBanInfoRepository } from './infrastructure/users/usersBanInfo.repository';
import { ChangeUserBanStatusForBloggersUseCase } from './app/useCases/usersBanInfo/changeUserBanStatusForBloggers.useCase';
import { UsersBanInfoForBlogs } from './infrastructure/users/usersBanInfoForBlogs.entity';
import { UsersBloggerController } from './api/blogger/users.blogger.controller';
import { UsersBanInfoQueryRepository } from './infrastructure/users/usersBanInfo.query-repository';
import { Blog } from '../blogs/infrastructure/blogs.entity';
import { GetBannedUsersUseCase } from './app/useCases/usersBanInfo/getBannedUsers.useCase';
import { BlogsRepository } from '../blogs/infrastructure/blogs.repository';

const usersUseCases = [
  CreateUserUseCase,
  ChangeUserBanStatusUseCase,
  ChangeUserBanStatusForBloggersUseCase,
  GetBannedUsersUseCase,
];

const usersProviders = [
  UsersService,
  UsersRepository,
  UsersQueryRepository,
  UsersDevicesRepository,
  UsersBanInfoRepository,
  UsersBanInfoQueryRepository,
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
