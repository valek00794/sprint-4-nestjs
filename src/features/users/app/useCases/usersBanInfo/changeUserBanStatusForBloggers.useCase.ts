import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';
import { ChangeUserBanStatusForBloggerInputModel } from 'src/features/users/api/models/input/users.input.models';
import { UsersQueryRepository } from 'src/features/users/infrastructure/users/users.query-repository';
import { UsersBanInfoRepository } from 'src/features/users/infrastructure/users/usersBanInfo.repository';
import { FieldError } from 'src/infrastructure/exception.filter.types';

export class ChangeUserBanStatusForBloggersCommand {
  constructor(
    public userIdNeedBan: string,
    public inputModel: ChangeUserBanStatusForBloggerInputModel,
    public ownerBlogUserId?: string,
  ) {}
}

@CommandHandler(ChangeUserBanStatusForBloggersCommand)
export class ChangeUserBanStatusForBloggersUseCase
  implements ICommandHandler<ChangeUserBanStatusForBloggersCommand>
{
  constructor(
    protected usersBanInfoRepository: UsersBanInfoRepository,
    protected usersQueryRepository: UsersQueryRepository,
    protected blogsRepository: BlogsRepository,
  ) {}
  async execute(command: ChangeUserBanStatusForBloggersCommand) {
    const userIdNeedBan = Number(command.userIdNeedBan);
    const blogId = Number(command.inputModel.blogId);
    const ownerBlogUserId = command.ownerBlogUserId ? +command.ownerBlogUserId : null;
    if (isNaN(userIdNeedBan)) {
      throw new BadRequestException([new FieldError('Id syntax error', 'id')]);
    }

    const user = await this.usersQueryRepository.findUserById(userIdNeedBan);
    if (!user) {
      throw new NotFoundException('The user that should be banned does not exist');
    }
    const blog = await this.blogsRepository.findBlogById(blogId);
    if (
      !blog ||
      (blog && blog.blogOwnerInfo && ownerBlogUserId && blog.blogOwnerInfo.id !== ownerBlogUserId)
    ) {
      throw new ForbiddenException('You are not owner of blog');
    }
    if (!command.inputModel.isBanned) {
      await this.usersBanInfoRepository.unBanUserForBlog(userIdNeedBan, blogId);
    } else {
      await this.usersBanInfoRepository.banUserForBlog(
        userIdNeedBan,
        blogId,
        command.inputModel.banReason,
        new Date().toISOString(),
      );
    }
    return;
  }
}
