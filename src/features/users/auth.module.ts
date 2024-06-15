import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

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
import { UsersDevices, UsersDevicesSchema } from './infrastructure/devices/usersDevices.schema';
import { UsersRepository } from './infrastructure/users/users.repository';
import {
  User,
  UsersRecoveryPasssword,
  UsersSchema,
  usersRecoveryPassswordSchema,
} from './infrastructure/users/users.schema';
import { UsersQueryRepository } from './infrastructure/users/users.query-repository';
import { APP_GUARD } from '@nestjs/core';

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
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UsersSchema,
      },
      {
        name: UsersRecoveryPasssword.name,
        schema: usersRecoveryPassswordSchema,
      },
      {
        name: UsersDevices.name,
        schema: UsersDevicesSchema,
      },
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
