import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { User, UserEmailConfirmationInfo, UsersRecoveryPasssword } from './users.entity';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createUser(newUser: User, emailConfirmationInfo?: UserEmailConfirmationInfo) {
    const queryUsers = `
     INSERT INTO "users" ("Login", "Email", "CreatedAt", "PasswordHash") 
     VALUES ('${newUser.login}', '${newUser.email}', '${newUser.createdAt}', 
            '${newUser.passwordHash}')
      RETURNING "Id" as "id", "Login" as "login", "Email" as "email", "CreatedAt" as "createdAt"
    `;
    const user = await this.dataSource.query(queryUsers);
    if (emailConfirmationInfo) {
      const queryEmailComfirmation = `
      INSERT INTO "emailConfirmations" ("ConfirmationCode", "ExpirationDate", "IsConfirmed", "UserId") 
      VALUES ('${emailConfirmationInfo.confirmationCode}', '${emailConfirmationInfo.expirationDate}', '${emailConfirmationInfo.isConfirmed}', 
             '${user[0].id}')
     `;
      await this.dataSource.query(queryEmailComfirmation);
    }
    return user[0];
  }

  async deleteUserById(id: string): Promise<boolean> {
    const queryUsers = `
      DELETE FROM "users"
      WHERE "Id" = '${id}'
    `;
    const queryEmailComfirmation = `
    DELETE FROM "emailConfirmations"
    WHERE "UserId" = '${id}'
  `;
    const result = await this.dataSource.query(queryUsers);
    await this.dataSource.query(queryEmailComfirmation);
    return result[1] === 1 ? true : false;
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
    userId: string,
    emailConfirmationInfo: UserEmailConfirmationInfo,
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
    //
    // if (result.affectedRows > 0) {
    //   const querySelectUser = `
    //   SELECT * FROM users
    //   WHERE id = '${userId}'
    // `;
    //   const updatedUser = await this.dataSource.query(querySelectUser);
    //   return updatedUser[0];
    // } else {
    //   return null;
    // }
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
    updatedRecoveryInfo: UsersRecoveryPasssword,
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
    const query = `
    SELECT "Id" as "id", "Login" as "login", "Email" as "email", "CreatedAt" as "createdAt", "PasswordHash" as "passwordHash"
    FROM "users" 
    WHERE "Email" = $1 OR "Login" = $1;
    `;
    const user = await this.dataSource.query(query, [loginOrEmail]);
    return user.length !== 0 ? user[0] : null;
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
