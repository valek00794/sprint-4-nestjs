import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { UsersController } from './api/users.controller';
import { UsersRepository } from './infrastructure/users/users.repository';
import { UsersService } from './app/users.service';
import { UsersQueryRepository } from './infrastructure/users/users.query-repository';
import { SignUpUserUseCase } from './app/useCases/users/signUpUser.useCase';
import { PasswordRecoveryUseCase } from './app/useCases/users/passwordRecovery.useCase';
import { CreateUserUseCase } from './app/useCases/users/createUser.useCase';
import { ConfirmPasswordRecoveryUseCase } from './app/useCases/users/confirmPasswordRecovery.useCase';
import { JwtAdapter } from 'src/infrastructure/adapters/jwt/jwt-adapter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UsersRecoveryPasssword } from './infrastructure/users/users.entity';

const usersUseCases = [
  SignUpUserUseCase,
  PasswordRecoveryUseCase,
  CreateUserUseCase,
  ConfirmPasswordRecoveryUseCase,
];

const usersProviders = [UsersService, UsersRepository, UsersQueryRepository];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([User, UsersRecoveryPasssword])],
  controllers: [UsersController],
  providers: [JwtAdapter, ...usersProviders, ...usersUseCases],
})
export class UsersModule {}
