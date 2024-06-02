import { Body, Controller, Get, Post, Req, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';

import { SETTINGS } from 'src/settings/settings';
import { AuthService } from '../app/auth.service';
import { UsersService } from '../app/users.service';
import { UsersQueryRepository } from '../infrastructure/users/users.query-repository';
import { UsersDevicesService } from '../app/userDevices.service';
import {
  SignInModel,
  PasswordRecoveryModel,
  type EmailInputModel,
  type RegistrationConirmationModel,
} from './models/input/auth.input.models';
import { UserInfo } from '../domain/users.types';
import { CreateUserModel } from '../api/models/input/users.input.models';
import { Public } from '../domain/decorators/public.decorator';
import { AuthBearerGuard } from 'src/infrastructure/guards/auth-bearer.guards';

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
  @Public()
  @Post('/login')
  async signIn(@Body() inputModel: SignInModel, @Res() res: Response, @Req() req: Request) {
    const deviceTitle = req.headers['user-agent'] || 'unknown device';
    const ipAddress = req.socket.remoteAddress || '0.0.0.0';
    const tokens = await this.authService.signIn(inputModel);
    await this.usersDevicesService.addUserDevice(tokens.refreshToken, deviceTitle, ipAddress);
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true });
    res.status(HttpStatus.OK).send({
      accessToken: tokens.accessToken,
    });
  }

  @Public()
  @Post('/password-recovery')
  async passwordRecovery(@Body() inputModel: EmailInputModel) {
    await this.usersService.passwordRecovery(inputModel.email);
  }

  @Public()
  @Post('/new-password')
  async confirmPasswordRecovery(@Body() passwordRecoveryModel: PasswordRecoveryModel) {
    await this.usersService.confirmPasswordRecovery(passwordRecoveryModel);
  }

  @Public()
  @Post('/registration-confirmation')
  async signUpConfimation(@Body() inputModel: RegistrationConirmationModel) {
    await this.authService.confirmEmail(inputModel.code);
  }

  @Public()
  @Post('/registration')
  async signUp(@Body() inputModel: CreateUserModel) {
    await this.usersService.signUpUser(inputModel);
  }

  @Public()
  @Post('/registration-email-resending')
  async signUpEmailResending(@Body() inputModel: EmailInputModel) {
    await this.authService.resentConfirmEmail(inputModel.email);
  }

  @UseGuards(AuthBearerGuard)
  @Get('/me')
  async getAuthInfo(@Req() req: CustomRequest, @Res() res: Response) {
    const user = await this.usersQueryRepository.findUserById(req.user!.userId);
    if (!user) res.status(HttpStatus.UNAUTHORIZED);
    res.status(HttpStatus.OK).send(user);
  }
}
