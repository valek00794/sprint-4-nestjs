import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceUnavailableException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns/add';

import { JwtAdapter } from 'src/infrastructure/adapters/jwt/jwt-adapter';
import { bcryptArapter } from 'src/infrastructure/adapters/bcrypt/bcrypt.adapter';
import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';
import { CreateUserInputModel } from 'src/features/users/api/models/input/users.input.models';
import { emailManager } from 'src/features/common/managers/email-manager';

export class SignUpUserCommand {
  constructor(public inputModel: CreateUserInputModel) {}
}

@CommandHandler(SignUpUserCommand)
export class SignUpUserUseCase implements ICommandHandler<SignUpUserCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected jwtAdapter: JwtAdapter,
  ) {}
  async execute(command: SignUpUserCommand) {
    const passwordHash = await bcryptArapter.generateHash(command.inputModel.password);
    const signUpData = {
      login: command.inputModel.login,
      email: command.inputModel.email,
      passwordHash,
      createdAt: new Date().toISOString(),
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), {
          hours: 1,
        }),
        isConfirmed: false,
      },
    };
    const createdUser = await this.usersRepository.createUser(signUpData);

    if (signUpData.emailConfirmation) {
      try {
        await emailManager.sendEmailConfirmationMessage(
          signUpData.email,
          signUpData.emailConfirmation.confirmationCode,
        );
      } catch (error) {
        console.error(error);
        this.usersRepository.deleteUserById(createdUser._id!.toString());
        throw new ServiceUnavailableException('Error sending confirmation email');
      }
    }
    return true;
  }
}
