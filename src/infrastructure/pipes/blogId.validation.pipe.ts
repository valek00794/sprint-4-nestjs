import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { BlogsQueryRepository } from 'src/features/blogs/infrastructure/blogs.query-repository';

@ValidatorConstraint({ async: true })
export class BlogIdExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}
  async validate(blogId: any) {
    const blog = await this.blogsQueryRepository.findBlog(blogId);
    if (!blog) return false;
    return true;
  }
}

export function IsBlogIdExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: BlogIdExistConstraint,
    });
  };
}
