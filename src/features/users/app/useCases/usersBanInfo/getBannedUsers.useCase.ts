import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { UsersBanInfoQueryRepository } from 'src/features/users/infrastructure/users/usersBanInfo.query-repository';

export class GetBannedUsersCommand {
  constructor(
    public blogId: string,
    public query?: SearchQueryParametersType,
    public ownerBlogUserId?: string,
  ) {}
}

@CommandHandler(GetBannedUsersCommand)
export class GetBannedUsersUseCase implements ICommandHandler<GetBannedUsersCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected usersBanInfoQueryRepository: UsersBanInfoQueryRepository,
  ) {}
  async execute(command: GetBannedUsersCommand) {
    const blogId = +command.blogId;
    const ownerBlogUserId = command.ownerBlogUserId ? +command.ownerBlogUserId : null;
    const blog = await this.blogsRepository.findBlogById(blogId);
    //if (!blog || (blog && blog.blogOwnerInfo && blog.blogOwnerInfo.id !== blogId)) {
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    console.log(blog);
    console.log(blog.blogOwnerInfo!.id);
    console.log(ownerBlogUserId);
    if (
      blog &&
      blog.blogOwnerInfo &&
      ownerBlogUserId &&
      blog.blogOwnerInfo.id !== ownerBlogUserId
    ) {
      throw new ForbiddenException('You are not owner of blog');
    }
    return await this.usersBanInfoQueryRepository.getBannedUsersForBlog(blogId, command.query);
  }
}
