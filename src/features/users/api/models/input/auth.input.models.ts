import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { VALIDATE_PHARAMS } from './users.input.models';

export class SignInInputModel {
  @IsNotEmpty()
  loginOrEmail: string;
  @IsNotEmpty()
  password: string;
}

export class PasswordRecoveryInputModel {
  @Length(VALIDATE_PHARAMS.password.minLength, VALIDATE_PHARAMS.password.maxLength)
  newPassword: string;
  @IsNotEmpty()
  recoveryCode: string;
}

export class EmailInputModel {
  @IsEmail()
  email: string;
}

export class ConirmationCodeInputModel {
  @IsNotEmpty()
  code: string;
}
