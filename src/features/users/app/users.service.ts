import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns/add';

import { User, UserDocument } from '../infrastructure/users/users.schema';
import { UsersRepository } from '../infrastructure/users/users.repository';
import { CreateUserModel } from '../api/models/input/users.input.models';
import { emailManager } from 'src/features/common/managers/email-manager';
import { PasswordRecoveryInputModel } from '../api/models/input/auth.input.models';
import { bcryptArapter } from 'src/infrastructure/adapters/bcrypt/bcrypt.adapter';
import { FieldError } from 'src/infrastructure/exception.filter.types';
import { isValidMongoId } from 'src/features/utils';

@Injectable()
export class UsersService {
  constructor(
    protected usersRepository: UsersRepository,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createUser(inputModel: CreateUserModel) {
    const passwordHash = await bcryptArapter.generateHash(inputModel.password);

    const signUpData = new this.userModel({
      login: inputModel.login,
      email: inputModel.email,
      passwordHash,
      createdAt: new Date().toISOString(),
      emailConfirmation: null,
    });
    return await this.usersRepository.createUser(signUpData);
  }

  async signUpUser(inputModel: CreateUserModel) {
    const passwordHash = await bcryptArapter.generateHash(inputModel.password);
    const signUpData = new this.userModel({
      login: inputModel.login,
      email: inputModel.email,
      passwordHash,
      createdAt: new Date().toISOString(),
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), {
          hours: 1,
        }),
        isConfirmed: false,
      },
    });
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
    return;
  }

  async updateUserPassword(userId: string, password: string): Promise<boolean> {
    if (!isValidMongoId(userId)) {
      throw new NotFoundException('User not found');
    }
    const passwordHash = await bcryptArapter.generateHash(password);
    return await this.usersRepository.updateUserPassword(userId, passwordHash);
  }

  async deleteUserById(id: string): Promise<boolean> {
    if (!isValidMongoId(id)) {
      throw new NotFoundException('User not found');
    }
    return await this.usersRepository.deleteUserById(id);
  }

  async passwordRecovery(email: string): Promise<UserDocument> {
    const user = await this.usersRepository.findUserByLoginOrEmail(email);
    if (user === null) {
      throw new NotFoundException('User not found');
    }

    const newUserRecoveryPasswordInfo = {
      recoveryCode: uuidv4(),
      expirationDate: add(new Date(), {
        hours: 1,
      }),
    };
    try {
      await emailManager.sendEmailPasswordRecoveryMessage(
        email,
        newUserRecoveryPasswordInfo.recoveryCode,
      );
    } catch (error) {
      console.error(error);
      throw new BadRequestException([
        new FieldError('Error sending confirmation email', 'email sender'),
      ]);
    }
    const userId = user!._id!.toString();
    return await this.usersRepository.updatePasswordRecoveryInfo(userId, {
      ...newUserRecoveryPasswordInfo,
      userId,
    });
  }

  async confirmPasswordRecovery(
    passwordRecoveryModel: PasswordRecoveryInputModel,
  ): Promise<boolean> {
    const recoveryInfo = await this.usersRepository.findPasswordRecoveryInfo(
      passwordRecoveryModel.recoveryCode,
    );
    if (recoveryInfo === null) {
      throw new BadRequestException([
        new FieldError('User with current recovery code not found', 'recovery code'),
      ]);
    }

    if (recoveryInfo !== null) {
      if (recoveryInfo.recoveryCode !== passwordRecoveryModel.recoveryCode) {
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

    return await this.updateUserPassword(recoveryInfo!.userId!, passwordRecoveryModel.newPassword);
  }
}
