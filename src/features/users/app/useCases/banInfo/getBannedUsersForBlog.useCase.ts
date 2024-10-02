import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { BanInfoQueryRepository } from 'src/features/users/infrastructure/banInfo/banInfo.query-repository';

export class GetBannedUsersForBlogCommand {
  constructor(
    public blogId: string,
    public query?: SearchQueryParametersType,
    public ownerBlogUserId?: string,
  ) {}
}

@CommandHandler(GetBannedUsersForBlogCommand)
export class GetBannedUsersForBlogUseCase implements ICommandHandler<GetBannedUsersForBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected banInfoQueryRepository: BanInfoQueryRepository,
  ) {}
  async execute(command: GetBannedUsersForBlogCommand) {
    const blogId = +command.blogId;
    const ownerBlogUserId = command.ownerBlogUserId ? +command.ownerBlogUserId : null;
    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    if (
      blog &&
      blog.blogOwnerInfo &&
      ownerBlogUserId &&
      blog.blogOwnerInfo.id !== ownerBlogUserId
    ) {
      throw new ForbiddenException('You are not owner of blog');
    }
    return await this.banInfoQueryRepository.getBannedUsersForBlog(blogId, command.query);
  }
}
