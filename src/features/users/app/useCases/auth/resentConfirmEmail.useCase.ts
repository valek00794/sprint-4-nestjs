import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns/add';

import { EmailInputModel } from 'src/features/users/api/models/input/auth.input.models';
import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';
import { FieldError } from 'src/infrastructure/exception.filter.types';
import { emailManager } from 'src/features/common/managers/email-manager';

export class ResentConfirmEmailCommand {
  constructor(public inputModel: EmailInputModel) {}
}

@CommandHandler(ResentConfirmEmailCommand)
export class ResentConfirmEmailUseCase implements ICommandHandler<ResentConfirmEmailCommand> {
  constructor(protected usersRepository: UsersRepository) {}
  async execute(command: ResentConfirmEmailCommand) {
    const user = await this.usersRepository.findUserByLoginOrEmail(command.inputModel.email);
    if (user === null) {
      throw new BadRequestException([new FieldError('User with current email not found', 'email')]);
    }
    const userConfirmationInfo = user.emailConfirmation;
    if (userConfirmationInfo !== null && userConfirmationInfo.isConfirmed) {
      throw new BadRequestException([
        new FieldError('User with current email already confirmed', 'email'),
      ]);
    }

    const newUserConfirmationInfo = {
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), {
        hours: 1,
      }),
      isConfirmed: false,
    };

    try {
      await emailManager.sendEmailConfirmationMessage(
        command.inputModel.email,
        newUserConfirmationInfo.confirmationCode,
      );
    } catch (error) {
      console.error(error);
      this.usersRepository.deleteUserById(user!._id!.toString());
      throw new ServiceUnavailableException('Error sending confirmation email');
    }

    return await this.usersRepository.updateConfirmationInfo(
      user._id!.toString(),
      newUserConfirmationInfo,
    );
  }
}
