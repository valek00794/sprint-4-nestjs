import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { UserDeviceInfoType, UsersDevicesType } from '../../domain/users.types';

@Injectable()
export class UsersDevicesRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async addUserDevice(device: UsersDevicesType) {
    const query = `
      INSERT INTO "usersDevices"  ("DeviceId", "Title", "Ip", "UserId", "LastActiveDate", "ExpiryDate")
      VALUES ('${device.deviceId}', '${device.title}', '${device.ip}', '${device.userId}', '${device.lastActiveDate}', '${device.expiryDate}')
    `;
    await this.dataSource.query(query);
    return device;
  }

  async updateUserDevice(
    userVerifyInfoByOldToken: UserDeviceInfoType,
    newLastActiveDate: string,
    newExpiryDate: string,
  ) {
    const query = `
      UPDATE "usersDevices" 
      SET "LastActiveDate" = '${newLastActiveDate}', "ExpiryDate" = '${newExpiryDate}'
      WHERE "DeviceId" = '${userVerifyInfoByOldToken.deviceId}'
      AND "UserId" = '${userVerifyInfoByOldToken.userId}'
      AND "LastActiveDate" = '${new Date(userVerifyInfoByOldToken!.iat! * 1000).toISOString()}'
    `;

    return await this.dataSource.query(query);
  }

  async deleteUserDevices(userVerifyInfo: UserDeviceInfoType) {
    const query = `
      DELETE FROM "usersDevices" 
      WHERE "UserId" = '${userVerifyInfo.userId}'
      AND "DeviceId" != '${userVerifyInfo.deviceId}'
      AND "LastActiveDate" != '${new Date(userVerifyInfo.iat! * 1000).toISOString()}'
    `;

    return await this.dataSource.query(query);
  }

  async deleteUserDevicebyDeviceId(deviceId: string) {
    const query = `DELETE FROM "usersDevices"  WHERE "DeviceId" = '${deviceId}'`;
    return await this.dataSource.query(query);
  }

  async getUserDeviceByDeviceId(deviceId: string) {
    const query = `
      SELECT "DeviceId" as "deviceId", "Title" as "title", "Ip" as "ip", 
            "UserId" as "userId", "LastActiveDate" as "lastActiveDate", "ExpiryDate" as "expiryDate"
      FROM "usersDevices"  
      WHERE "DeviceId" = '${deviceId}'
    `;
    const result = await this.dataSource.query(query);
    return result.length !== 0 ? result[0] : null;
  }

  async getAllActiveDevicesByUser(userId: string) {
    const query = `
      SELECT "DeviceId" as "deviceId", "Title" as "title", "Ip" as "ip", 
        "UserId" as "userId", "LastActiveDate" as "lastActiveDate", "ExpiryDate" as "expiryDate"
      FROM "usersDevices"  
      WHERE "UserId" = '${userId}'
    `;
    return await this.dataSource.query(query);
  }
}
