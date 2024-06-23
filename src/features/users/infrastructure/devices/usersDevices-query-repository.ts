import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { UsersDevicesOutput } from '../../api/models/output/usersDevices.output.models';
import { UsersDevices } from './usersDevices.entity';

@Injectable()
export class UsersDevicesQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  // async getAllActiveDevicesByUser(userId: string): Promise<UsersDevicesOutput[]> {
  //   const userDevices = await this.usersDevicesModel.find({ userId });
  //   return userDevices.map((device) => this.mapToOutput(device));
  // }

  // async getUserDeviceById(deviceId: string): Promise<UsersDevicesOutput | null> {
  //   const deviceSession = await this.usersDevicesModel.findOne({ deviceId });
  //   return deviceSession ? this.mapToOutput(deviceSession) : null;
  // }

  // mapToOutput(userDevice: UsersDevices): UsersDevicesOutput {
  //   return new UsersDevicesOutput(
  //     userDevice.ip,
  //     userDevice.title,
  //     userDevice.deviceId,
  //     userDevice.lastActiveDate,
  //   );
  // }
}
