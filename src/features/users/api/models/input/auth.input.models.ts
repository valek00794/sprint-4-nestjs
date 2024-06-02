import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { VALIDATE_PHARAMS } from './users.input.models';

export class SignInModel {
  @IsNotEmpty()
  loginOrEmail: string;
  @IsNotEmpty()
  password: string;
}

export class PasswordRecoveryModel {
  @Length(VALIDATE_PHARAMS.password.minLength, VALIDATE_PHARAMS.password.maxLength)
  newPassword: string;
  @IsNotEmpty()
  recoveryCode: string;
}

export class EmailInputModel {
  @IsEmail()
  email: string;
}

export class RegistrationConirmationModel {
  @IsNotEmpty()
  code: string;
}
