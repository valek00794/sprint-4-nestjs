import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import { UsersDevicesController } from './api/usersDevices.controller';
import { AuthController } from './api/auth.controller';
import { AddUserDeviceUseCase } from './app/useCases/userDevices/addUserDevice.useCase';
import { UpdateUserDeviceUseCase } from './app/useCases/userDevices/updateUserDevice.useCase';
import { DeleteUserDeviceByIdUseCase } from './app/useCases/userDevices/deleteUserDeviceById.useCase';
import { SignInUseCase } from './app/useCases/auth/signIn.useCase';
import { ConfirmEmailUseCase } from './app/useCases/auth/confirmEmail.useCase';
import { ResentConfirmEmailUseCase } from './app/useCases/auth/resentConfirmEmail.useCase';
import { CheckUserByRefreshTokenUseCase } from './app/useCases/auth/checkUserByRefreshToken.useCase';
import { RenewTokensUseCase } from './app/useCases/auth/renewTokens.useCase';
import { LogoutUserUseCase } from './app/useCases/auth/logoutUser.useCase';
import { UsersDevicesService } from './app/userDevices.service';
import { UsersDevicesQueryRepository } from './infrastructure/devices/usersDevices-query-repository';
import { UsersDevicesRepository } from './infrastructure/devices/usersDevices-repository';
import { JwtAdapter } from 'src/infrastructure/adapters/jwt/jwt-adapter';
import { UsersRepository } from './infrastructure/users/users.repository';
import { UsersQueryRepository } from './infrastructure/users/users.query-repository';
import {
  User,
  UserEmailConfirmationInfo,
  UsersRecoveryPasssword,
} from './infrastructure/users/users.entity';
import { UsersDevices } from './infrastructure/devices/usersDevices.entity';

const usersDevicesUseCases = [
  AddUserDeviceUseCase,
  UpdateUserDeviceUseCase,
  DeleteUserDeviceByIdUseCase,
];

const authUseCases = [
  SignInUseCase,
  ConfirmEmailUseCase,
  ResentConfirmEmailUseCase,
  CheckUserByRefreshTokenUseCase,
  RenewTokensUseCase,
  LogoutUserUseCase,
];

const usersDevicesProviders = [
  UsersDevicesService,
  UsersDevicesQueryRepository,
  UsersDevicesRepository,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      User,
      UsersRecoveryPasssword,
      UserEmailConfirmationInfo,
      UsersDevices,
    ]),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
  ],
  controllers: [AuthController, UsersDevicesController],
  providers: [
    JwtAdapter,
    ...usersDevicesProviders,
    ...authUseCases,
    ...usersDevicesUseCases,
    UsersRepository,
    UsersQueryRepository,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AuthModule {}
