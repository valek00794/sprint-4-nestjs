import {
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';

import { JwtAdapter } from 'src/infrastructure/adapters/jwt/jwt-adapter';
import { ResultStatus, SETTINGS } from 'src/settings/settings';
import { UsersDevicesRepository } from '../infrastructure/devices/usersDevices-repository';
import { AuthService } from './auth.service';
import { UsersDevicesDocument } from '../infrastructure/devices/usersDevices.schema';

@Injectable()
export class UsersDevicesService {
  constructor(
    protected authService: AuthService,
    protected usersDevicesRepository: UsersDevicesRepository,
    protected jwtAdapter: JwtAdapter,
  ) {}

  async addUserDevice(
    refreshToken: string,
    deviceTitle: string,
    ipAddress: string,
  ): Promise<UsersDevicesDocument> {
    const userVerifyInfo = await this.jwtAdapter.getUserInfoByToken(
      refreshToken,
      SETTINGS.JWT.RT_SECRET,
    );
    const device = {
      deviceId: userVerifyInfo!.deviceId,
      title: deviceTitle,
      userId: userVerifyInfo!.userId,
      ip: ipAddress,
      lastActiveDate: new Date(userVerifyInfo!.iat! * 1000).toISOString(),
      expiryDate: new Date(userVerifyInfo!.exp! * 1000).toISOString(),
    };
    return await this.usersDevicesRepository.addUserDevice(device);
  }

  async updateUserDevice(oldRefreshToken: string, refreshToken: string) {
    const userVerifyInfoByOldToken = await this.jwtAdapter.getUserInfoByToken(
      oldRefreshToken,
      SETTINGS.JWT.RT_SECRET,
    );
    const userVerifyInfo = await this.jwtAdapter.getUserInfoByToken(
      refreshToken,
      SETTINGS.JWT.RT_SECRET,
    );
    const newLastActiveDate = new Date(userVerifyInfo!.iat! * 1000).toISOString();
    const newExpiryDate = new Date(userVerifyInfo!.exp! * 1000).toISOString();
    return await this.usersDevicesRepository.updateUserDevice(
      userVerifyInfoByOldToken!,
      newLastActiveDate,
      newExpiryDate,
    );
  }

  async getActiveDevicesByUser(refreshToken: string): Promise<UsersDevicesDocument[]> {
    const userVerifyInfo = await this.authService.checkUserByRefreshToken(refreshToken);
    if (userVerifyInfo === null) {
      throw new UnauthorizedException();
    }
    return await this.usersDevicesRepository.getAllActiveDevicesByUser(
      userVerifyInfo.userId.toString(),
    );
  }

  async deleteAllDevicesByUser(refreshToken: string) {
    const userVerifyInfo = await this.authService.checkUserByRefreshToken(refreshToken);
    if (userVerifyInfo === null) {
      throw new UnauthorizedException();
    }
    await this.usersDevicesRepository.deleteUserDevices(userVerifyInfo);
    throw new HttpException(ResultStatus.NoContent, HttpStatus.NO_CONTENT);
  }

  async deleteUserDeviceById(refreshToken: string, deviceId: string) {
    const userVerifyInfo = await this.authService.checkUserByRefreshToken(refreshToken);
    if (userVerifyInfo === null) {
      throw new UnauthorizedException();
    }
    const device = await this.usersDevicesRepository.getUserDeviceById(deviceId);
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    if (userVerifyInfo.userId !== device.userId) {
      throw new ForbiddenException();
    }
    await this.usersDevicesRepository.deleteUserDevicebyId(deviceId);
    throw new HttpException(ResultStatus.NoContent, HttpStatus.NO_CONTENT);
  }
}
