import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';
import { ConfirmPasswordRecoveryInputModel } from 'src/features/users/api/models/input/auth.input.models';
import { BadRequestException } from '@nestjs/common';
import { FieldError } from 'src/infrastructure/exception.filter.types';
import { UsersService } from '../../users.service';

export class ConfirmPasswordRecoveryCommand {
  constructor(public inputModel: ConfirmPasswordRecoveryInputModel) {}
}

@CommandHandler(ConfirmPasswordRecoveryCommand)
export class ConfirmPasswordRecoveryUseCase
  implements ICommandHandler<ConfirmPasswordRecoveryCommand>
{
  constructor(
    protected usersRepository: UsersRepository,
    protected usersService: UsersService,
  ) {}
  async execute(command: ConfirmPasswordRecoveryCommand) {
    const recoveryInfo = await this.usersRepository.findPasswordRecoveryInfo(
      command.inputModel.recoveryCode,
    );
    if (recoveryInfo === null) {
      throw new BadRequestException([
        new FieldError('User with current recovery code not found', 'recovery code'),
      ]);
    }

    if (recoveryInfo !== null) {
      if (recoveryInfo.recoveryCode !== command.inputModel.recoveryCode) {
        throw new BadRequestException([
          new FieldError('Recovery code does not match', 'recovery code'),
        ]);
      }
      if (recoveryInfo.expirationDate < new Date()) {
        throw new BadRequestException([
          new FieldError('Recovery code has expired, needs to be requested again', 'recovery code'),
        ]);
      }
    }

    return await this.usersService.updateUserPassword(
      recoveryInfo!.userId!,
      command.inputModel.newPassword,
    );
  }
}
