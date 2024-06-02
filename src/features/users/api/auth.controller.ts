import { Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';

import { SETTINGS, StatusCodes } from 'src/settings/settings';
import type { AuthService } from '../app/auth.service';
import type { UsersService } from '../app/users.service';
import type { UsersQueryRepository } from '../infrastructure/users/users.query-repository';
import type { UsersDevicesService } from '../app/userDevices.service';
import type { SignInModel } from './models/input/auth.input.models';
import { jwtAdapter } from 'src/infrastructure/adapters/jwt/jwt-adapter';
import type { UserInfo } from '../domain/users.types';

interface CustomRequest extends Request {
  user?: UserInfo;
}

@Controller(SETTINGS.PATH.auth)
export class AuthController {
  constructor(
    protected authService: AuthService,
    protected usersService: UsersService,
    protected usersDevicesService: UsersDevicesService,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post()
  async signInController(
    @Body() inputModel: SignInModel,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const user = await this.usersQueryRepository.findUserByLoginOrEmail(inputModel.loginOrEmail);
    if (user === null) {
      throw new UnauthorizedException();
    }
    const checkCredential = await this.authService.checkCredential(
      user._id.toString(),
      inputModel.password,
      user.passwordHash,
    );
    if (!checkCredential) {
      throw new UnauthorizedException();
    }
    const tokens = await jwtAdapter.createJWT(user._id!);
    const deviceTitle = req.headers['user-agent'] || 'unknown device';
    const ipAddress = req.ip || '0.0.0.0';
    await this.usersDevicesService.addUserDevice(tokens.refreshToken, deviceTitle, ipAddress);
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true });
    res.status(StatusCodes.OK_200).send({
      accessToken: tokens.accessToken,
    });
  }

  async getAuthInfoController(@Req() req: CustomRequest) {
    const user = await this.usersQueryRepository.findUserById(req.user!.userId);
    if (!req.user || !req.user.userId || !user) {
      throw new UnauthorizedException();
    }
    res.status(StatusCodes.OK_200).send(user);
  }
}
