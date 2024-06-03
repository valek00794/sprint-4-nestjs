import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  User,
  UserDocument,
  UserEmailConfirmationInfo,
  UsersRecoveryPasssword,
  UsersRecoveryPassswordDocument,
} from './users.schema';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UsersRecoveryPasssword.name)
    private usersRecoveryPassswordModel: Model<UsersRecoveryPassswordDocument>,
  ) {}

  async createUser(newUser: UserDocument) {
    const user = new this.userModel(newUser);
    await user.save();
    return user;
  }

  async deleteUserById(id: string): Promise<boolean> {
    const deleteResult = await this.userModel.findByIdAndDelete(id);
    return deleteResult ? true : false;
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<boolean> {
    await this.usersRecoveryPassswordModel.deleteOne({ userId });
    const updatedResult = await this.userModel.findByIdAndUpdate(
      userId,
      { passwordHash },
      { new: true },
    );
    return updatedResult ? true : false;
  }

  async updateConfirmationInfo(
    userId: string,
    emailConfirmationInfo: UserEmailConfirmationInfo,
  ): Promise<UserDocument | null> {
    return await this.userModel.findByIdAndUpdate(
      userId,
      {
        emailConfirmation: emailConfirmationInfo,
      },
      { new: true },
    );
  }

  async updateConfirmation(id: string) {
    return await this.userModel.findByIdAndUpdate(
      id,
      { 'emailConfirmation.isConfirmed': true },
      { new: true },
    );
  }

  async updatePasswordRecoveryInfo(
    userId: string,
    updatedRecoveryInfo: UsersRecoveryPasssword,
  ): Promise<UserDocument> {
    return this.usersRecoveryPassswordModel.findByIdAndUpdate(
      userId,
      { ...updatedRecoveryInfo },
      { upsert: true, new: true },
    );
  }

  async findUserByConfirmationCode(confirmationCode: string) {
    return await this.userModel.findOne({
      'emailConfirmation.confirmationCode': confirmationCode,
    });
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  }

  async findPasswordRecoveryInfo(recoveryCodeOrUserId: string) {
    return await this.usersRecoveryPassswordModel.findOne({
      $or: [{ recoveryCode: recoveryCodeOrUserId }, { userId: recoveryCodeOrUserId }],
    });
  }

  async findUserById(id: string): Promise<UserDocument | null> {
    return await this.userModel.findById(id);
  }
}