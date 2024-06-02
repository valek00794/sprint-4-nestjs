import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';

import { SETTINGS, StatusCodes } from 'src/settings/settings';
import { AuthService } from '../app/auth.service';
import { UsersService } from '../app/users.service';
import { UsersQueryRepository } from '../infrastructure/users/users.query-repository';
import { UsersDevicesService } from '../app/userDevices.service';
import { SignInModel, PasswordRecoveryModel } from './models/input/auth.input.models';
import { jwtAdapter } from 'src/infrastructure/adapters/jwt/jwt-adapter';
import { UserInfo } from '../domain/users.types';
import { CreateUserModel } from '../api/models/input/users.input.models';

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

  @Post('/login')
  async signIn(@Body() inputModel: SignInModel, @Res() res: Response, @Req() req: Request) {
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
  @Get('/me')
  async getAuthInfo(@Req() req: CustomRequest, @Res() res: Response) {
    const user = await this.usersQueryRepository.findUserById(req.user!.userId);
    if (!req.user || !req.user.userId || !user) {
      throw new UnauthorizedException();
    }
    res.status(StatusCodes.OK_200).send(user);
  }
  @Post('/registration')
  async signUp(@Body() inputModel: CreateUserModel, @Res() res: Response) {
    const result = await this.usersService.signUpUser(inputModel);
    if (result) {
      res.status(StatusCodes.NO_CONTENT_204).json();
      return;
    }
  }
  @Post('/registration-confirmation')
  async signUpConfimation(@Body() code: string, @Res() res: Response) {
    const confirmResult = await this.authService.confirmEmail(code);
    if (confirmResult) {
      res.status(StatusCodes.NO_CONTENT_204).send();
      return;
    }
  }
  @Post('/registration-email-resending')
  async signUpEmailResending(@Body() email: string, @Res() res: Response) {
    const sendResult = await this.authService.resentConfirmEmail(email);
    if (sendResult) {
      res.status(StatusCodes.NO_CONTENT_204).send();
      return;
    }
  }
  /*
  @Post('/registration-email-resending')
  async refreshToken(req: Request, res: Response<TokenOutType>) {
    const oldRefreshToken = req.cookies.refreshToken;
    const renewResult = await this.authService.renewTokens(oldRefreshToken);
    if (renewResult.status === ResultStatus.Unauthorized) {
      res.status(StatusCodes.UNAUTHORIZED_401).send();
      return;
    }

    if (renewResult.status === ResultStatus.Success) {
      await this.usersDevicesService.updateUserDevice(
        oldRefreshToken,
        renewResult.data!.refreshToken,
      );
      res.cookie('refreshToken', renewResult.data!.refreshToken, { httpOnly: true, secure: true });
      res.status(StatusCodes.OK_200).send({
        accessToken: renewResult.data!.accessToken,
      });
      return;
    }
  }
  @Post('/logout')
  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;
    const logoutResult = await this.authService.logoutUser(refreshToken);
    if (logoutResult.status === ResultStatus.Unauthorized) {
      res.status(StatusCodes.UNAUTHORIZED_401).send();
      return;
    }

    if (logoutResult.status === ResultStatus.NoContent) {
      res.status(StatusCodes.NO_CONTENT_204).send();
      return;
    }
  }*/
  @Post('/password-recovery')
  async passwordRecovery(@Body() email: string, @Res() res: Response) {
    const result = await this.usersService.passwordRecovery(email);
    if (result) {
      res.status(StatusCodes.NO_CONTENT_204).send();
      return;
    }
  }

  @Post('/new-password')
  async confirmPasswordRecovery(
    @Body() passwordRecoveryModel: PasswordRecoveryModel,
    @Res() res: Response,
  ) {
    const result = await this.usersService.confirmPasswordRecovery(passwordRecoveryModel);
    if (result) {
      res.status(StatusCodes.NO_CONTENT_204).send();
      return;
    }
  }
}
