import { Controller, Delete, Get, Param, HttpStatus, HttpCode, Req } from '@nestjs/common';
import { Request } from 'express';
import { CommandBus } from '@nestjs/cqrs';

import { SETTINGS } from 'src/settings/settings';
import { Public } from '../../../infrastructure/decorators/transform/public.decorator';
import { UsersDevicesService } from '../app/userDevices.service';
import { DeleteUserDeviceByIdCommand } from '../app/useCases/userDevices/deleteUserDeviceById.useCase';
import { CheckUserByRefreshTokenCommand } from '../app/useCases/auth/checkUserByRefreshToken.useCase';
import { UsersDevicesQueryRepository } from '../infrastructure/devices/usersDevices-query-repository';

@Public()
@Controller(SETTINGS.PATH.devices)
export class UsersDevicesController {
  constructor(
    protected usersDevicesService: UsersDevicesService,
    protected usersDevicesQueryRepository: UsersDevicesQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getActiveDevicesByUser(@Req() req: Request) {
    const userVerifyInfo = await this.commandBus.execute(
      new CheckUserByRefreshTokenCommand(req.cookies.refreshToken),
    );
    return await this.usersDevicesQueryRepository.getAllActiveDevicesByUser(
      userVerifyInfo.userId.toString(),
    );
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllUserDevices(@Req() req: Request) {
    await this.usersDevicesService.deleteAllDevicesByUser(req.cookies.refreshToken);
  }
  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserDeviceById(@Req() req: Request, @Param('deviceId') deviceId: string) {
    await this.commandBus.execute(
      new DeleteUserDeviceByIdCommand(req.cookies.refreshToken, deviceId),
    );
  }
}
