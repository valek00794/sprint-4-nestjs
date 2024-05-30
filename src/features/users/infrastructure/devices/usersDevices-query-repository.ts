import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UsersDevices, type UsersDevicesDocument } from './usersDevices.schema';
import { UsersDevicesOutput } from '../../api/models/output/usersDevices.output.models';

@Injectable()
export class UsersDevicesQueryRepository {
  constructor(
    @InjectModel(UsersDevices.name) private usersDevicesModel: Model<UsersDevicesDocument>,
  ) {}
  async getAllActiveDevicesByUser(userId: string): Promise<UsersDevicesOutput[]> {
    const userDevices = await this.usersDevicesModel.find({ userId });
    return userDevices.map((device) => this.mapToOutput(device));
  }

  async getUserDeviceById(deviceId: string): Promise<UsersDevicesOutput | null> {
    const deviceSession = await this.usersDevicesModel.findOne({ deviceId });
    return deviceSession ? this.mapToOutput(deviceSession) : null;
  }

  mapToOutput(userDevice: UsersDevicesDocument): UsersDevicesOutput {
    return new UsersDevicesOutput(
      userDevice.ip,
      userDevice.title,
      userDevice.deviceId,
      userDevice.lastActiveDate,
    );
  }
}
