import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersRepository } from '../users/infrastructure/users/users.repository';
import { BlogsQueryRepository } from '../blogs/infrastructure/blogs.query-repository';
import { IsUserAlreadyExistConstraint } from 'src/infrastructure/decorators/validate/user-exists.decorator';
import { BlogIdExistConstraint } from 'src/infrastructure/decorators/validate/blog-exists.decorator';
import { User } from '../users/infrastructure/users/user.entity';
import { UserEmailConfirmationInfo } from '../users/infrastructure/users/usersEmailConfirmationInfo.entity';
import { UsersRecoveryPasssword } from '../users/infrastructure/users/usersRecoveryPasssword.entity';
import { Blog } from '../blogs/infrastructure/blogs.entity';
import { UserTelegramInfo } from '../users/infrastructure/integratons/userTelegramInfo.entity';

const validationConstraints = [IsUserAlreadyExistConstraint, BlogIdExistConstraint];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserEmailConfirmationInfo,
      UsersRecoveryPasssword,
      Blog,
      UserTelegramInfo,
    ]),
  ],
  controllers: [],
  providers: [...validationConstraints, UsersRepository, BlogsQueryRepository],
})
export class ConstraintsModule {}
