import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersDevicesOutput } from '../../api/models/output/usersDevices.output.models';
import { UsersDevices } from './usersDevices.entity';

@Injectable()
export class UsersDevicesQueryRepository {
  constructor(
    @InjectRepository(UsersDevices) protected usersDevicesRepository: Repository<UsersDevices>,
  ) {}

  async getAllActiveDevicesByUser(userId: number): Promise<UsersDevicesOutput[]> {
    const userDevices = await this.usersDevicesRepository.find({
      where: { userId },
    });
    return userDevices.map((device) => this.mapToOutput(device));
  }

  async getUserDeviceByDeviceId(deviceId: string): Promise<UsersDevicesOutput | null> {
    const deviceSession = await this.usersDevicesRepository.findOne({
      where: { deviceId },
    });
    return deviceSession ? this.mapToOutput(deviceSession) : null;
  }

  mapToOutput(userDevice: UsersDevices): UsersDevicesOutput {
    return new UsersDevicesOutput(
      userDevice.ip,
      userDevice.title,
      userDevice.deviceId,
      userDevice.lastActiveDate.toISOString(),
    );
  }
}
