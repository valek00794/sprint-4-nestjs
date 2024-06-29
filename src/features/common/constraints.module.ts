import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Blog, BlogsSchema } from '../blogs/infrastructure/blogs.schema';
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
    ]),
  ],
  controllers: [],
  providers: [...validationConstraints, UsersRepository, BlogsQueryRepository],
})
export class ConstraintsModule {}
