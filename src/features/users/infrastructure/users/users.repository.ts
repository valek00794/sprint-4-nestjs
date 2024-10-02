import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './users.entity';
import { UsersRecoveryPasssword } from './UsersRecoveryPasssword.entity ';
import {
  UserType,
  UserEmailConfirmationInfoType,
  UsersRecoveryPassswordType,
} from '../../domain/users.types';
import { UserEmailConfirmationInfo } from './usersEmailConfirmationInfo.entity';
import { UsersBanInfo } from './usersBanInfo.entity';
@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) protected usersRepository: Repository<User>,
    @InjectRepository(UserEmailConfirmationInfo)
    protected userEmailConfirmationInfoRepository: Repository<UserEmailConfirmationInfo>,
    @InjectRepository(UsersRecoveryPasssword)
    protected usersRecoveryPassswordRepository: Repository<UsersRecoveryPasssword>,
  ) {}

  async createUser(newUser: UserType, emailConfirmationInfo?: UserEmailConfirmationInfoType) {
    const user = await this.usersRepository.save(newUser);
    if (emailConfirmationInfo) {
      const confirmationInfo = await this.userEmailConfirmationInfoRepository.save({
        ...emailConfirmationInfo,
        userId: user.id,
      });
      user.emailConfirmation = confirmationInfo;
      await this.usersRepository.save(user);
    }
    return user;
  }

  async deleteUserById(id: number): Promise<boolean> {
    const result = await this.usersRepository.delete({ id });
    await this.userEmailConfirmationInfoRepository.delete({ userId: id });
    return result.affected === 1 ? true : false;
  }

  async updateUserPassword(userId: number, passwordHash: string): Promise<boolean> {
    await this.usersRecoveryPassswordRepository.delete({ userId });
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (user) {
      user.passwordHash = passwordHash;
      await this.usersRepository.save(user);
      return true;
    } else {
      return false;
    }
  }
  async updateConfirmationInfo(
    userId: number,
    emailConfirmationInfo: UserEmailConfirmationInfoType,
  ): Promise<boolean> {
    const confirmationInfo = await this.userEmailConfirmationInfoRepository.findOne({
      where: { userId },
    });
    if (confirmationInfo) {
      confirmationInfo.confirmationCode = emailConfirmationInfo.confirmationCode;
      confirmationInfo.expirationDate = emailConfirmationInfo.expirationDate;
      confirmationInfo.isConfirmed = emailConfirmationInfo.isConfirmed;

      await this.userEmailConfirmationInfoRepository.save(confirmationInfo);
      return true;
    } else {
      return false;
    }
  }

  async updateConfirmation(userId: number): Promise<UserEmailConfirmationInfo | null> {
    const emailConfirmation = await this.userEmailConfirmationInfoRepository.findOne({
      where: { userId },
    });

    if (!emailConfirmation) {
      return null;
    }

    emailConfirmation.isConfirmed = true;
    await this.userEmailConfirmationInfoRepository.save(emailConfirmation);

    return emailConfirmation;
  }

  async updatePasswordRecoveryInfo(
    userId: number,
    updatedRecoveryInfo: UsersRecoveryPassswordType,
  ): Promise<UsersRecoveryPasssword | null> {
    const usersRecoveryPassword = await this.usersRecoveryPassswordRepository.findOne({
      where: { userId },
    });

    if (!usersRecoveryPassword) {
      return null;
    }

    usersRecoveryPassword.expirationDate = updatedRecoveryInfo.expirationDate;
    usersRecoveryPassword.recoveryCode = updatedRecoveryInfo.recoveryCode;
    await this.usersRecoveryPassswordRepository.save(usersRecoveryPassword);

    return usersRecoveryPassword;
  }

  async findUserConfirmationInfoByCode(confirmationCode: string) {
    return await this.userEmailConfirmationInfoRepository.findOne({
      where: { confirmationCode },
    });
  }

  async findUserConfirmationInfoByUserId(userId: number) {
    return await this.userEmailConfirmationInfoRepository.findOne({
      where: { userId },
    });
  }

  async findUserByLoginOrEmail(loginOrEmail: string) {
    return await this.usersRepository.findOne({
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
      relations: {
        emailConfirmation: true,
        banInfo: true,
      },
    });
  }

  async findPasswordRecoveryInfo(recoveryCodeOrUserId: string) {
    return await this.usersRecoveryPassswordRepository.findOne({
      where: [{ recoveryCode: recoveryCodeOrUserId }, { userId: Number(recoveryCodeOrUserId) }],
    });
  }

  async findUserById(id: number): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { id },
    });
  }
  async updateBanInfo(userId: number, banInfo: UsersBanInfo): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (user) {
      user.banInfo = banInfo;
      await this.usersRepository.save(user);
      return true;
    } else {
      return false;
    }
  }
}
