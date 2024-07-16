import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersRepository } from '../users/infrastructure/users/users.repository';
import { BlogsQueryRepository } from '../blogs/infrastructure/blogs.query-repository';
import { IsUserAlreadyExistConstraint } from 'src/infrastructure/decorators/validate/user-exists.decorator';
import { BlogIdExistConstraint } from 'src/infrastructure/decorators/validate/blogId.decorator';
import { User } from '../users/infrastructure/users/users.entity';
import { UserEmailConfirmationInfo } from '../users/infrastructure/users/usersEmailConfirmationInfo.entity';

const validationConstraints = [IsUserAlreadyExistConstraint, BlogIdExistConstraint];

@Module({
  imports: [TypeOrmModule.forFeature([User, UserEmailConfirmationInfo])],
  controllers: [],
  providers: [...validationConstraints, UsersRepository, BlogsQueryRepository],
})
export class ConstraintsSModule {}
