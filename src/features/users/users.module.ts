import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersController } from './api/users.controller';
import { UsersRepository } from './infrastructure/users/users.repository';
import { UsersService } from './app/users.service';
import { UsersQueryRepository } from './infrastructure/users/users.query-repository';
import { SignUpUserUseCase } from './app/useCases/users/signUpUser.useCase';
import { PasswordRecoveryUseCase } from './app/useCases/users/passwordRecovery.useCase';
import { CreateUserUseCase } from './app/useCases/users/createUser.useCase';
import { ConfirmPasswordRecoveryUseCase } from './app/useCases/users/confirmPasswordRecovery.useCase';
import {
  User,
  UsersRecoveryPasssword,
  UsersSchema,
  usersRecoveryPassswordSchema,
} from './infrastructure/users/users.schema';
import { JwtAdapter } from 'src/infrastructure/adapters/jwt/jwt-adapter';

const usersUseCases = [
  SignUpUserUseCase,
  PasswordRecoveryUseCase,
  CreateUserUseCase,
  ConfirmPasswordRecoveryUseCase,
];

const usersProviders = [UsersService, UsersRepository, UsersQueryRepository];

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
    ]),
  ],
  controllers: [UsersController],
  providers: [JwtAdapter, ...usersProviders, ...usersUseCases],
})
export class UsersModule {}
