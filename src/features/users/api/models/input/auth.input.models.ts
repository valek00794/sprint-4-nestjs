import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { VALIDATE_PHARAMS } from './users.input.models';
import { Trim } from 'src/infrastructure/decorators/transform/trim.decorator';

export class SignInInputModel {
  @Trim()
  @IsNotEmpty()
  loginOrEmail: string;
  @Trim()
  @IsNotEmpty()
  password: string;
}

export class PasswordRecoveryInputModel {
  @Trim()
  @Length(VALIDATE_PHARAMS.password.minLength, VALIDATE_PHARAMS.password.maxLength)
  newPassword: string;
  @Trim()
  @IsNotEmpty()
  recoveryCode: string;
}

export class EmailInputModel {
  @Trim()
  @IsEmail()
  email: string;
}

export class ConirmationCodeInputModel {
  @Trim()
  @IsNotEmpty()
  code: string;
}
