import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Blog, BlogsSchema } from '../blogs/infrastructure/blogs.schema';
import {
  User,
  UsersRecoveryPasssword,
  UsersSchema,
  usersRecoveryPassswordSchema,
} from '../users/infrastructure/users/users.schema';
import { UsersRepository } from '../users/infrastructure/users/users.repository';
import { BlogsQueryRepository } from '../blogs/infrastructure/blogs.query-repository';
import { IsUserAlreadyExistConstraint } from 'src/infrastructure/decorators/validate/user-exists.decorator';
import { BlogIdExistConstraint } from 'src/infrastructure/decorators/validate/blogId.decorator';

const validationConstraints = [IsUserAlreadyExistConstraint, BlogIdExistConstraint];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: BlogsSchema,
      },
      {
        name: User.name,
        schema: UsersSchema,
      },
      {
        name: UsersRecoveryPasssword.name,
        schema: usersRecoveryPassswordSchema,
      },
    ]),
  ],
  controllers: [],
  providers: [...validationConstraints, UsersRepository, BlogsQueryRepository],
})
export class ConstraintsModule {}
