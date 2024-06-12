import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  HttpStatus,
  UseGuards,
  Ip,
  Headers,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { CommandBus } from '@nestjs/cqrs';

import { SETTINGS } from 'src/settings/settings';
import { UsersService } from '../app/users.service';
import { UsersQueryRepository } from '../infrastructure/users/users.query-repository';
import { UsersDevicesService } from '../app/userDevices.service';
import {
  SignInInputModel,
  PasswordRecoveryInputModel,
  type EmailInputModel,
  type ConirmationCodeInputModel,
} from './models/input/auth.input.models';
import { CreateUserModel } from '../api/models/input/users.input.models';
import { Public } from '../../../infrastructure/decorators/transform/public.decorator';
import { AuthBearerGuard } from 'src/infrastructure/guards/auth-bearer.guards';
import { AddUserDeviceCommand } from '../app/useCases/userDevices/addUserDevice.useCase';
import { SignInCommand } from '../app/useCases/auth/signIn.useCase';
import { ConfirmEmailCommand } from '../app/useCases/auth/confirmEmail.useCase';
import { ResentConfirmEmailCommand } from '../app/useCases/auth/resentConfirmEmail.useCase';

@Controller(SETTINGS.PATH.auth)
export class AuthController {
  constructor(
    protected usersService: UsersService,
    protected usersDevicesService: UsersDevicesService,
    protected usersQueryRepository: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}
  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() inputModel: SignInInputModel,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const tokens = await this.commandBus.execute(new SignInCommand(inputModel));
    await this.commandBus.execute(new AddUserDeviceCommand(tokens.refreshToken, userAgent, ip));
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true });
    return {
      accessToken: tokens.accessToken,
    };
  }

  @Public()
  @Post('/password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() inputModel: EmailInputModel) {
    await this.usersService.passwordRecovery(inputModel.email);
  }

  @Public()
  @Post('/new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmPasswordRecovery(@Body() passwordRecoveryModel: PasswordRecoveryInputModel) {
    await this.usersService.confirmPasswordRecovery(passwordRecoveryModel);
  }

  @Public()
  @Post('/registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signUpConfimation(@Body() inputModel: ConirmationCodeInputModel) {
    await this.commandBus.execute(new ConfirmEmailCommand(inputModel));
  }

  @Public()
  @Post('/registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signUp(@Body() inputModel: CreateUserModel) {
    await this.usersService.signUpUser(inputModel);
  }

  @Public()
  @Post('/registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signUpEmailResending(@Body() inputModel: EmailInputModel) {
    await this.commandBus.execute(new ResentConfirmEmailCommand(inputModel));
  }

  @UseGuards(AuthBearerGuard)
  @Get('/me')
  @HttpCode(HttpStatus.OK)
  async getAuthInfo(@Req() req: Request) {
    const user = await this.usersQueryRepository.findUserById(req.user!.userId);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
