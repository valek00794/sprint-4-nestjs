import { IsEmail, Length, Matches } from 'class-validator';
import { IsUserAlreadyExist } from 'src/infrastructure/pipes/user-exists.validation.pipe';

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
  @IsUserAlreadyExist({
    message: 'User $value already exists. Choose another login.',
  })
  login: string;
  @IsEmail()
  @IsUserAlreadyExist({
    message: 'User $value already exists. Choose another email.',
  })
  email: string;
  @Length(VALIDATE_PHARAMS.password.minLength, VALIDATE_PHARAMS.password.maxLength)
  password: string;
}
