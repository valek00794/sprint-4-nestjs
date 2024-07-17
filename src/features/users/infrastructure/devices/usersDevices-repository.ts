import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { UserDeviceInfoType, UsersDevicesType } from '../../domain/users.types';
import { UsersDevices } from './usersDevices.entity';

@Injectable()
export class UsersDevicesRepository {
  constructor(
    @InjectRepository(UsersDevices) protected usersDevicesRepository: Repository<UsersDevices>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}
  async addUserDevice(device: UsersDevicesType): Promise<UsersDevices> {
    return await this.usersDevicesRepository.save(device);
  }

  async updateUserDevice(
    userVerifyInfoByOldToken: UserDeviceInfoType,
    newLastActiveDate: Date,
    newExpiryDate: Date,
  ): Promise<boolean> {
    const device = await this.usersDevicesRepository.findOne({
      where: {
        deviceId: userVerifyInfoByOldToken.deviceId,
        userId: userVerifyInfoByOldToken.userId,
        lastActiveDate: new Date(userVerifyInfoByOldToken!.iat! * 1000),
      },
    });
    if (device) {
      device.lastActiveDate = newLastActiveDate;
      device.expiryDate = newExpiryDate;
      await this.usersDevicesRepository.save(device);
      return true;
    } else {
      return false;
    }
  }

  async deleteUserDevices(userVerifyInfo: UserDeviceInfoType) {
    const result = await this.usersDevicesRepository.delete({
      deviceId: userVerifyInfo.deviceId,
      userId: userVerifyInfo.userId,
      lastActiveDate: new Date(userVerifyInfo!.iat! * 1000),
    });
    return result.affected === 1 ? true : false;
  }

  async deleteUserDevicebyDeviceId(deviceId: string) {
    const result = await this.usersDevicesRepository.delete({
      deviceId,
    });
    return result.affected === 1 ? true : false;
  }

  async getUserDeviceByDeviceId(deviceId: string) {
    return await this.usersDevicesRepository.findOneBy({ deviceId });
  }

  // async getAllActiveDevicesByUser(userId: number) {
  //   return await this.usersDevicesRepository.findBy({ userId });
  // }
}
