import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { UserDeviceInfoType, UsersDevicesType } from '../../domain/users.types';

@Injectable()
export class UsersDevicesRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  // async addUserDevice(device: UsersDevicesType): Promise<UsersDevicesDocument> {
  //   const newDevice = new this.usersDevicesModel(device);
  //   await newDevice.save();
  //   return newDevice;
  // }

  // async updateUserDevice(
  //   userVerifyInfoByOldToken: UserDeviceInfoType,
  //   newLastActiveDate: string,
  //   newExpiryDate: string,
  // ) {
  //   return await this.usersDevicesModel.updateOne(
  //     {
  //       deviceId: userVerifyInfoByOldToken.deviceId,
  //       userId: userVerifyInfoByOldToken.userId,
  //       lastActiveDate: new Date(userVerifyInfoByOldToken!.iat! * 1000).toISOString(),
  //     },
  //     {
  //       $set: {
  //         lastActiveDate: newLastActiveDate,
  //         expiryDate: newExpiryDate,
  //       },
  //     },
  //   );
  // }

  // async deleteUserDevices(userVerifyInfo: UserDeviceInfoType) {
  //   return await this.usersDevicesModel.deleteMany({
  //     userId: userVerifyInfo.userId,
  //     deviceId: { $ne: userVerifyInfo.deviceId },
  //     lastActiveDate: { $ne: new Date(userVerifyInfo!.iat! * 1000).toISOString() },
  //   });
  // }

  // async deleteUserDevicebyDeviceId(deviceId: string) {
  //   return await this.usersDevicesModel.deleteOne({ deviceId });
  // }

  // async getUserDeviceByDeviceId(deviceId: string): Promise<UsersDevicesDocument | null> {
  //   return await this.usersDevicesModel.findOne({ deviceId });
  // }

  // async getAllActiveDevicesByUser(userId: string): Promise<UsersDevicesDocument[]> {
  //   return await this.usersDevicesModel.find({ userId });
  // }
}
