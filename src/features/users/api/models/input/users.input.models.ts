import { IsEmail, Length, Matches } from 'class-validator';
import { Trim } from 'src/infrastructure/decorators/transform/trim.decorator';
import { IsUserAlreadyExist } from 'src/infrastructure/decorators/validate/user-exists.decorator';

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
  @Trim()
  @Length(VALIDATE_PHARAMS.login.minLength, VALIDATE_PHARAMS.login.maxLength)
  @Matches(VALIDATE_PHARAMS.login.pattern)
  @IsUserAlreadyExist({
    message: 'User $value already exists. Choose another login.',
  })
  login: string;
  @Trim()
  @IsEmail()
  @IsUserAlreadyExist({
    message: 'User $value already exists. Choose another email.',
  })
  email: string;
  @Trim()
  @Length(VALIDATE_PHARAMS.password.minLength, VALIDATE_PHARAMS.password.maxLength)
  password: string;
}
