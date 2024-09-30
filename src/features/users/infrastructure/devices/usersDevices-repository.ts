import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { UserDeviceInfoType, UsersDevicesType } from '../../domain/users.types';
import { UsersDevices } from './usersDevices.entity';

@Injectable()
export class UsersDevicesRepository {
  constructor(
    @InjectRepository(UsersDevices) protected usersDevicesRepository: Repository<UsersDevices>,
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

  async deleteUserDevicesExceptCurrent(userVerifyInfo: UserDeviceInfoType) {
    return await this.usersDevicesRepository.delete({
      userId: userVerifyInfo.userId,
      deviceId: Not(userVerifyInfo.deviceId),
      lastActiveDate: Not(new Date(userVerifyInfo!.iat! * 1000)),
    });
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

  async deleteAllUserDevices(userId: number) {
    return await this.usersDevicesRepository.delete({
      userId,
    });
  }
}
