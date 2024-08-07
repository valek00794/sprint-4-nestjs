import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './api/admin/users.controller';
import { UsersRepository } from './infrastructure/users/users.repository';
import { UsersService } from './app/users.service';
import { UsersQueryRepository } from './infrastructure/users/users.query-repository';
import { SignUpUserUseCase } from './app/useCases/users/signUpUser.useCase';
import { PasswordRecoveryUseCase } from './app/useCases/users/passwordRecovery.useCase';
import { CreateUserUseCase } from './app/useCases/users/createUser.useCase';
import { ConfirmPasswordRecoveryUseCase } from './app/useCases/users/confirmPasswordRecovery.useCase';
import { JwtAdapter } from 'src/infrastructure/adapters/jwt/jwt-adapter';
import { User } from './infrastructure/users/users.entity';
import { UserEmailConfirmationInfo } from './infrastructure/users/usersEmailConfirmationInfo.entity';
import { UsersRecoveryPasssword } from './infrastructure/users/UsersRecoveryPasssword.entity ';

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
    TypeOrmModule.forFeature([User, UserEmailConfirmationInfo, UsersRecoveryPasssword]),
  ],
  controllers: [UsersController],
  providers: [JwtAdapter, ...usersProviders, ...usersUseCases],
})
export class UsersModule {}
