import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { UsersDevicesOutput } from '../../api/models/output/usersDevices.output.models';
import { UsersDevices } from './usersDevices.entity';

@Injectable()
export class UsersDevicesQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getAllActiveDevicesByUser(userId: string): Promise<UsersDevicesOutput[]> {
    const query = `SELECT * FROM users_devices WHERE UserId = '${userId}'`;
    const userDevices = await this.dataSource.query(query);
    return userDevices.map((device) => this.mapToOutput(device));
  }

  async getUserDeviceByDeviceId(deviceId: string): Promise<UsersDevicesOutput | null> {
    const query = `SELECT * FROM users_devices WHERE DeviceId = '${deviceId}'`;
    const deviceSession = await this.dataSource.query(query);
    return deviceSession[0] ? this.mapToOutput(deviceSession) : null;
  }

  mapToOutput(userDevice: UsersDevices): UsersDevicesOutput {
    return new UsersDevicesOutput(
      userDevice.ip,
      userDevice.title,
      userDevice.deviceId,
      userDevice.lastActiveDate,
    );
  }
}
