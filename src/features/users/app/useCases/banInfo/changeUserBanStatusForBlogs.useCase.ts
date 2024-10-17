import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';
import { ChangeUserBanStatusForBloggerInputModel } from 'src/features/users/api/models/input/users.input.models';
import { BanInfoRepository } from 'src/features/users/infrastructure/banInfo/banInfo.repository';
import { UsersQueryRepository } from 'src/features/users/infrastructure/users/users.query-repository';

export class ChangeUserBanStatusForBlogsCommand {
  constructor(
    public userIdNeedBan: string,
    public inputModel: ChangeUserBanStatusForBloggerInputModel,
    public ownerBlogUserId?: string,
  ) {}
}

@CommandHandler(ChangeUserBanStatusForBlogsCommand)
export class ChangeUserBanStatusForBlogsUseCase
  implements ICommandHandler<ChangeUserBanStatusForBlogsCommand>
{
  constructor(
    protected usersBanInfoRepository: BanInfoRepository,
    protected usersQueryRepository: UsersQueryRepository,
    protected blogsRepository: BlogsRepository,
  ) {}
  async execute(command: ChangeUserBanStatusForBlogsCommand) {
    const user = await this.usersQueryRepository.findUserById(command.userIdNeedBan);
    if (!user) {
      throw new NotFoundException('The user that should be banned does not exist');
    }
    const blog = await this.blogsRepository.findBlogById(command.inputModel.blogId);
    if (
      !blog ||
      (blog &&
        blog.blogOwnerInfo &&
        command.ownerBlogUserId &&
        blog.blogOwnerInfo.id !== command.ownerBlogUserId)
    ) {
      throw new ForbiddenException('You are not owner of blog');
    }
    if (!command.inputModel.isBanned) {
      await this.usersBanInfoRepository.unBanUserForBlog(
        command.userIdNeedBan,
        command.inputModel.blogId,
      );
    } else {
      await this.usersBanInfoRepository.banUserForBlog(
        command.userIdNeedBan,
        command.inputModel.blogId,
        command.inputModel.banReason,
        new Date().toISOString(),
      );
    }
    return;
  }
}
