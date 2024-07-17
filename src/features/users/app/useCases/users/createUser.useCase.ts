import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { bcryptArapter } from 'src/infrastructure/adapters/bcrypt/bcrypt.adapter';
import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';
import { CreateUserInputModel } from 'src/features/users/api/models/input/users.input.models';

export class CreateUserCommand {
  constructor(public inputModel: CreateUserInputModel) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(protected usersRepository: UsersRepository) {}
  async execute(command: CreateUserCommand) {
    const passwordHash = await bcryptArapter.generateHash(command.inputModel.password);
    const signUpData = {
      login: command.inputModel.login,
      email: command.inputModel.email,
      passwordHash,
      createdAt: new Date().toISOString(),
      emailConfirmation: null,
    };
    return await this.usersRepository.createUser(signUpData);
  }
}
