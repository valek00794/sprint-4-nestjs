import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns/add';

import { User, UserDocument } from '../infrastructure/users/users.schema';
import { UsersRepository } from '../infrastructure/users/users.repository';
import { CreateUserModel } from '../api/models/input/users.input.models';
import { emailManager } from 'src/features/users/domain/managers/email-manager';
import { bcryptArapter } from 'src/infrastructure/adapters/bcrypt.adapter';
import { ResultStatus, StatusCodes } from 'src/settings/settings';

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
    return true;
  }

  async updateUserPassword(userId: string, password: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId)) {
      return false;
    }
    const passwordHash = await bcryptArapter.generateHash(password);
    return await this.usersRepository.updateUserPassword(userId, passwordHash);
  }

  async deleteUserById(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    return await this.usersRepository.deleteUserById(id);
  }

  async passwordRecovery(email: string): Promise<null> {
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
      throw new BadRequestException('Error sending confirmation email');
    }
    const userId = user!._id!.toString();
    await this.usersRepository.updatePasswordRecoveryInfo(userId, {
      ...newUserRecoveryPasswordInfo,
      userId,
    });
    throw new HttpException(ResultStatus.NoContent, StatusCodes.NO_CONTENT_204);
  }

  async confirmPasswordRecovery(recoveryCode: string, newPassword: string): Promise<true> {
    const recoveryInfo = await this.usersRepository.findPasswordRecoveryInfo(recoveryCode);
    if (recoveryInfo === null) {
      throw new BadRequestException('User with current recovery code not found');
    }

    if (recoveryInfo !== null) {
      if (recoveryInfo.recoveryCode !== recoveryCode) {
        throw new BadRequestException('Recovery code does not match');
      }
      if (recoveryInfo.expirationDate < new Date()) {
        throw new BadRequestException('Recovery code has expired, needs to be requested again');
      }
    }

    await this.updateUserPassword(recoveryInfo!.userId!, newPassword);

    return true;
  }
}
