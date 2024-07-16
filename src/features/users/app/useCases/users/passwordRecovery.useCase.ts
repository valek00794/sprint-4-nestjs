import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns/add';

import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';
import { emailManager } from 'src/features/common/managers/email-manager';
import { PasswordRecoveryEmailInputModel } from 'src/features/users/api/models/input/auth.input.models';
import { FieldError } from 'src/infrastructure/exception.filter.types';

export class PasswordRecoveryCommand {
  constructor(public inputModel: PasswordRecoveryEmailInputModel) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase implements ICommandHandler<PasswordRecoveryCommand> {
  constructor(protected usersRepository: UsersRepository) {}
  async execute(command: PasswordRecoveryCommand) {
    const user = await this.usersRepository.findUserByLoginOrEmail(command.inputModel.email);
    if (user === null) {
      throw new NotFoundException('User not found');
    }

    const newUserRecoveryPasswordInfo = {
      recoveryCode: uuidv4(),
      expirationDate: add(new Date(), {
        hours: 1,
      }).toISOString(),
    };
    try {
      await emailManager.sendEmailPasswordRecoveryMessage(
        command.inputModel.email,
        newUserRecoveryPasswordInfo.recoveryCode,
      );
    } catch (error) {
      console.error(error);
      throw new BadRequestException([
        new FieldError('Error sending confirmation email', 'email sender'),
      ]);
    }
    const userId = user!.id!.toString();
    return await this.usersRepository.updatePasswordRecoveryInfo(userId, {
      ...newUserRecoveryPasswordInfo,
      userId,
    });
  }
}
