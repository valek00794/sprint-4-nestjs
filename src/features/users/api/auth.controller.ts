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
import { UsersQueryRepository } from '../infrastructure/users/users.query-repository';
import {
  SignInInputModel,
  ConfirmPasswordRecoveryInputModel,
  type PasswordRecoveryEmailInputModel,
  type ConirmationCodeInputModel,
} from './models/input/auth.input.models';
import { CreateUserInputModel } from '../api/models/input/users.input.models';
import { Public } from '../../../infrastructure/decorators/transform/public.decorator';
import { AuthBearerGuard } from 'src/infrastructure/guards/auth-bearer.guards';
import { AddUserDeviceCommand } from '../app/useCases/userDevices/addUserDevice.useCase';
import { SignInCommand } from '../app/useCases/auth/signIn.useCase';
import { ConfirmEmailCommand } from '../app/useCases/auth/confirmEmail.useCase';
import { ResentConfirmEmailCommand } from '../app/useCases/auth/resentConfirmEmail.useCase';
import { SignUpUserCommand } from '../app/useCases/users/signUpUser.useCase';
import { PasswordRecoveryCommand } from '../app/useCases/users/passwordRecovery.useCase';
import { ConfirmPasswordRecoveryCommand } from '../app/useCases/users/confirmPasswordRecovery.useCase';

@Controller(SETTINGS.PATH.auth)
export class AuthController {
  constructor(
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
  async passwordRecovery(@Body() inputModel: PasswordRecoveryEmailInputModel) {
    await this.commandBus.execute(new PasswordRecoveryCommand(inputModel));
  }

  @Public()
  @Post('/new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmPasswordRecovery(@Body() inputModel: ConfirmPasswordRecoveryInputModel) {
    await this.commandBus.execute(new ConfirmPasswordRecoveryCommand(inputModel));
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
  async signUp(@Body() inputModel: CreateUserInputModel) {
    await await this.commandBus.execute(new SignUpUserCommand(inputModel));
  }

  @Public()
  @Post('/registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signUpEmailResending(@Body() inputModel: PasswordRecoveryEmailInputModel) {
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
