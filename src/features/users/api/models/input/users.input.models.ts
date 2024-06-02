import { IsEmail, Length, Matches } from 'class-validator';

export const VALIDATE_PHARAMS = {
  password: {
    minLength: 6,
    maxLength: 20,
  },
  login: {
    minLength: 3,
    maxLength: 10,
    pattern: new RegExp(/^[a-zA-Z0-9_-]*$/),
  },
};

export class CreateUserModel {
  @Length(VALIDATE_PHARAMS.login.minLength, VALIDATE_PHARAMS.login.maxLength)
  @Matches(VALIDATE_PHARAMS.login.pattern)
  login: string;
  @IsEmail()
  email: string;
  @Length(VALIDATE_PHARAMS.password.minLength, VALIDATE_PHARAMS.password.maxLength)
  password: string;
}
