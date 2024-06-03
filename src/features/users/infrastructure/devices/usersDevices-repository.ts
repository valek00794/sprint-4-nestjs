import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UsersDevices, type UsersDevicesDocument } from './usersDevices.schema';
import { UserDeviceInfoType, UsersDevicesType } from '../../domain/users.types';

@Injectable()
export class UsersDevicesRepository {
  constructor(
    @InjectModel(UsersDevices.name) private usersDevicesModel: Model<UsersDevicesDocument>,
  ) {}
  async addUserDevice(device: UsersDevicesType): Promise<UsersDevicesDocument> {
    const newDevice = new this.usersDevicesModel(device);
    await newDevice.save();
    return newDevice;
  }

  async updateUserDevice(
    userVerifyInfo: UserDeviceInfoType,
    newLastActiveDate: string,
    newExpiryDate: string,
  ) {
    return await this.usersDevicesModel.updateOne(
      {
        deviceId: userVerifyInfo.deviceId,
        userId: userVerifyInfo.userId,
        lastActiveDate: new Date(userVerifyInfo!.iat! * 1000).toISOString(),
      },
      {
        $set: {
          lastActiveDate: newLastActiveDate,
          expiryDate: newExpiryDate,
        },
      },
    );
  }

  async deleteUserDevices(userVerifyInfo: UserDeviceInfoType) {
    return await this.usersDevicesModel.deleteMany({
      userId: userVerifyInfo.userId,
      deviceId: { $ne: userVerifyInfo.deviceId },
      lastActiveDate: { $ne: new Date(userVerifyInfo!.iat! * 1000).toISOString() },
    });
  }

  async deleteUserDevicebyId(deviceId: string) {
    return await this.usersDevicesModel.deleteOne({ deviceId });
  }

  async getUserDeviceById(deviceId: string): Promise<UsersDevicesDocument | null> {
    return await this.usersDevicesModel.findOne({ deviceId });
  }

  async getAllActiveDevicesByUser(userId: string): Promise<UsersDevicesDocument[]> {
    return await this.usersDevicesModel.find({ userId });
  }
}