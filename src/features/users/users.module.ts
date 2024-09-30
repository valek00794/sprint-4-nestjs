import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './api/admin/users.controller';
import { UsersRepository } from './infrastructure/users/users.repository';
import { UsersService } from './app/users.service';
import { UsersQueryRepository } from './infrastructure/users/users.query-repository';
import { CreateUserUseCase } from './app/useCases/users/createUser.useCase';
import { JwtAdapter } from 'src/infrastructure/adapters/jwt/jwt-adapter';
import { User } from './infrastructure/users/users.entity';
import { UserEmailConfirmationInfo } from './infrastructure/users/usersEmailConfirmationInfo.entity';
import { UsersRecoveryPasssword } from './infrastructure/users/UsersRecoveryPasssword.entity ';
import { ChangeUserBanStatusUseCase } from './app/useCases/users/changeUserBanStatus.useCase';
import { UsersDevicesRepository } from './infrastructure/devices/usersDevices-repository';
import { UsersDevices } from './infrastructure/devices/usersDevices.entity';
import { UsersBanStatuses } from './infrastructure/users/usersBanStatuses.entity';
import { UsersBanInfoRepository } from './infrastructure/users/usersBanInfo.repository';

const usersUseCases = [CreateUserUseCase, ChangeUserBanStatusUseCase];

const usersProviders = [
  UsersService,
  UsersRepository,
  UsersQueryRepository,
  UsersDevicesRepository,
  UsersBanInfoRepository,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      User,
      UserEmailConfirmationInfo,
      UsersRecoveryPasssword,
      UsersDevices,
      UsersBanStatuses,
    ]),
  ],
  controllers: [UsersController],
  providers: [JwtAdapter, ...usersProviders, ...usersUseCases],
})
export class UsersModule {}
