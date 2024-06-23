import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User, UserEmailConfirmationInfo, UsersRecoveryPasssword } from './users.entity';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createUser(newUser: User) {
    const query = `
     INSERT INTO users (login, email, createdAt, passwordHash, emailConfirmation) 
     VALUES ('${newUser.login}', '${newUser.email}', '${newUser.createdAt}', 
            '${newUser.passwordHash}', '${newUser.emailConfirmation}')
    `;

    this.dataSource.query(query);
    return newUser;
  }

  async deleteUserById(id: string): Promise<boolean> {
    const query = `
      DELETE FROM users
      WHERE id = '${id}'
    `;
    const result = await this.dataSource.query(query);
    return result.affectedRows > 0 ? true : false;
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<boolean> {
    const queryDeleteRecovery = `
      DELETE FROM users_recovery_password
      WHERE userId = '${userId}'
    `;
    await this.dataSource.query(queryDeleteRecovery);
    const queryUpdatePassword = `
      UPDATE users
      SET passwordHash = '${passwordHash}'
      WHERE id = '${userId}'
    `;
    const result = await this.dataSource.query(queryUpdatePassword);
    return result.affectedRows > 0 ? true : false;
  }

  async updateConfirmationInfo(
    userId: string,
    emailConfirmationInfo: UserEmailConfirmationInfo,
  ): Promise<User | null> {
    const query = `
    UPDATE users
    SET emailConfirmation = '${emailConfirmationInfo}'
    WHERE id = '${userId}'
  `;
    const result = await this.dataSource.query(query);
    if (result.affectedRows > 0) {
      const querySelectUser = `
      SELECT * FROM users
      WHERE id = '${userId}'
    `;
      const updatedUser = await this.dataSource.query(querySelectUser);
      return updatedUser[0];
    } else {
      return null;
    }
  }

  async updateConfirmation(id: string): Promise<User> {
    const query = `
    UPDATE users
    SET emailConfirmation.isConfirmed = true
    WHERE id = '${id}'
  `;
    return await this.dataSource.query(query);
  }

  async updatePasswordRecoveryInfo(
    userId: string,
    updatedRecoveryInfo: UsersRecoveryPasssword,
  ): Promise<User> {
    const query = `
      UPDATE users_recovery_password
      SET expirationDate = '${updatedRecoveryInfo.expirationDate}', recoveryCode = '${updatedRecoveryInfo.recoveryCode}'
      WHERE userId = '${userId}'
    `;
    return await this.dataSource.query(query);
  }

  // async findUserByConfirmationCode(confirmationCode: string) {
  //   const query = `
  //     SELECT * FROM users WHERE emailConfirmation = '${emailConfirmationInfo}' AND id = '${userId}'
  //   `;
  //   return await this.dataSource.query(query);
  // }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const query = `
        SELECT * 
        FROM users 
        WHERE email = $1 OR login = $1;
      `;
    const user = await this.dataSource.query<User[]>(query, [loginOrEmail]);
    return user ? user[0] : null;
  }

  async findPasswordRecoveryInfo(recoveryCodeOrUserId: string) {
    return await this.usersRecoveryPassswordModel.findOne({
      $or: [{ recoveryCode: recoveryCodeOrUserId }, { userId: recoveryCodeOrUserId }],
    });
  }

  async findUserById(id: string): Promise<User | null> {
    const query = `
    SELECT * 
    FROM users 
    WHERE id = $1;
  `;
    const user = await this.dataSource.query<User[]>(query, [id]);
    return user ? user[0] : null;
  }
}
