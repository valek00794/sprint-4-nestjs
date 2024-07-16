import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { User } from './users.entity';
import { UsersRecoveryPasssword } from './UsersRecoveryPasssword.entity ';
import {
  UserType,
  UserEmailConfirmationInfoType,
  UsersRecoveryPassswordType,
} from '../../domain/users.types';
import { UserEmailConfirmationInfo } from './usersEmailConfirmationInfo.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(User) protected usersRepository: Repository<User>,
    @InjectRepository(UserEmailConfirmationInfo)
    protected userEmailConfirmationInfoRepository: Repository<UserEmailConfirmationInfo>,
  ) {}

  async createUser(newUser: UserType, emailConfirmationInfo?: UserEmailConfirmationInfoType) {
    const user = await this.usersRepository.save(newUser);
    if (emailConfirmationInfo) {
      await this.userEmailConfirmationInfoRepository.save(emailConfirmationInfo);
    }
    return user;
  }

  async deleteUserById(id: number): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      return false;
    }
    await this.usersRepository.remove(user);
    const emailConfirmationInfo = await this.userEmailConfirmationInfoRepository.findOne({
      where: { id },
    });
    if (emailConfirmationInfo) {
      await this.userEmailConfirmationInfoRepository.remove(emailConfirmationInfo);
    }
    return true;
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<boolean> {
    const queryDeleteRecovery = `
      DELETE FROM "usersRecoveryPassword"
      WHERE "UserId" = '${userId}'
    `;
    await this.dataSource.query(queryDeleteRecovery);
    const queryUpdatePassword = `
      UPDATE "users"
      SET "PasswordHash" = '${passwordHash}'
      WHERE "Id" = '${userId}'
    `;
    const result = await this.dataSource.query(queryUpdatePassword);
    return result[1] === 1 ? true : false;
  }
  async updateConfirmationInfo(
    userId: number,
    emailConfirmationInfo: UserEmailConfirmationInfoType,
  ): Promise<boolean> {
    const query = `
    UPDATE "emailConfirmations"
    SET "ConfirmationCode" = '${emailConfirmationInfo.confirmationCode}',
        "ExpirationDate" = '${emailConfirmationInfo.expirationDate}',
        "IsConfirmed" = '${emailConfirmationInfo.isConfirmed}'
    WHERE "UserId" = '${userId}'
  `;
    const result = await this.dataSource.query(query);
    return result[1] === 1 ? true : false;
  }

  async updateConfirmation(userId: string): Promise<User> {
    const query = `
    UPDATE "emailConfirmations"
    SET "IsConfirmed" = true
    WHERE "UserId" = '${userId}'
  `;
    return await this.dataSource.query(query);
  }

  async updatePasswordRecoveryInfo(
    userId: string,
    updatedRecoveryInfo: UsersRecoveryPassswordType,
  ): Promise<User> {
    const query = `
      UPDATE "usersRecoveryPassword"
      SET "ExpirationDate" = '${updatedRecoveryInfo.expirationDate}', "RecoveryCode" = '${updatedRecoveryInfo.recoveryCode}'
      WHERE "UserId" = '${userId}'
    `;
    return await this.dataSource.query(query);
  }

  async findUserConfirmationInfoByCode(confirmationCode: string) {
    const query = `
      SELECT "Id" as "id", "UserId" as "userId", "IsConfirmed" as "isConfirmed", "ConfirmationCode" as "confirmationCode", "ExpirationDate" as "expirationDate" 
      FROM "emailConfirmations" 
      WHERE "ConfirmationCode" = $1;
    `;
    const info = await this.dataSource.query(query, [confirmationCode]);
    return info.length !== 0 ? info[0] : null;
  }

  async findUserConfirmationInfoByUserId(userId: number) {
    const query = `
      SELECT "Id" as "id", "UserId" as "userId", "IsConfirmed" as "isConfirmed", "ConfirmationCode" as "confirmationCode", "ExpirationDate" as "expirationDate" 
      FROM "emailConfirmations" 
      WHERE "UserId" = $1;
    `;
    const info = await this.dataSource.query(query, [userId]);
    return info.length !== 0 ? info[0] : null;
  }

  async findUserByLoginOrEmail(loginOrEmail: string) {
    return await this.usersRepository.findOne({
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }

  async findPasswordRecoveryInfo(recoveryCodeOrUserId: string) {
    const query = `
    SELECT * 
    FROM "usersRecoveryPassword" 
    WHERE "RecoveryCode" = $1 OR "UserId" = $1;
  `;
    const user = await this.dataSource.query<UsersRecoveryPasssword[]>(query, [
      recoveryCodeOrUserId,
    ]);
    return user.length !== 0 ? user[0] : null;
  }

  async findUserById(id: string): Promise<User | null> {
    const query = `
    SELECT * 
    FROM "users" 
    WHERE "Id" = $1;
  `;
    const user = await this.dataSource.query<User[]>(query, [id]);
    return user.length !== 0 ? user[0] : null;
  }
}
