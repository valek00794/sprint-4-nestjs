import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';

import { JwtAdapter } from 'src/infrastructure/adapters/jwt/jwt-adapter';
import { bcryptArapter } from 'src/infrastructure/adapters/bcrypt/bcrypt.adapter';
import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';
import { SignInInputModel } from 'src/features/users/api/models/input/auth.input.models';

export class SignInCommand {
  constructor(public inputModel: SignInInputModel) {}
}

@CommandHandler(SignInCommand)
export class SignInUseCase implements ICommandHandler<SignInCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected jwtAdapter: JwtAdapter,
  ) {}
  async execute(command: SignInCommand) {
    const user = await this.usersRepository.findUserByLoginOrEmail(command.inputModel.loginOrEmail);
    if (user === null) throw new UnauthorizedException();
    const isAuth = await bcryptArapter.checkPassword(
      command.inputModel.password,
      user.passwordHash,
    );
    if (!isAuth) throw new UnauthorizedException();
    return await this.jwtAdapter.createJWTs(user.id.toString());
  }
}
