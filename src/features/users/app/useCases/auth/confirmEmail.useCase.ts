import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';

import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';
import { ConirmationCodeInputModel } from 'src/features/users/api/models/input/auth.input.models';

export class ConfirmEmailCommand {
  constructor(public inputModel: ConirmationCodeInputModel) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase implements ICommandHandler<ConfirmEmailCommand> {
  constructor(protected usersRepository: UsersRepository) {}
  async execute(command: ConfirmEmailCommand) {
    const userConfirmationInfo = await this.usersRepository.findUserConfirmationInfoByCode(
      command.inputModel.code,
    );
    if (userConfirmationInfo === null) {
      throw new BadRequestException([
        { message: 'User with verification code not found', field: 'code' },
      ]);
    }
    if (userConfirmationInfo !== null) {
      if (userConfirmationInfo.isConfirmed) {
        throw new BadRequestException([
          { message: 'Verification code does not match', field: 'code' },
        ]);
      }
      if (userConfirmationInfo.confirmationCode !== command.inputModel.code) {
        throw new BadRequestException([
          { message: 'Verification code does not match', field: 'code' },
        ]);
      }
      if (userConfirmationInfo.expirationDate < new Date()) {
        throw new BadRequestException([
          { message: 'Verification code has expired, needs to be requested again', field: 'code' },
        ]);
      }
    }
    return await this.usersRepository.updateConfirmation(userConfirmationInfo.userId);
  }
}
