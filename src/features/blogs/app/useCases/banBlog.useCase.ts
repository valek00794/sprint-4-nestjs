import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { ChangeBanStatusForBlogInputModel } from '../../api/models/input/blogs.input.model';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class BanBlogCommand {
  constructor(
    public blogId: string,
    public inputModel: ChangeBanStatusForBlogInputModel,
    public userId?: string,
  ) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(command: BanBlogCommand) {
    const blog = await this.blogsRepository.findBlogById(command.blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    if (!command.inputModel.isBanned) {
      await this.blogsRepository.unBanBlog(command.blogId);
    } else {
      const banDate = new Date().toISOString();
      await this.blogsRepository.banBlog(command.blogId, banDate);
    }
    return;
  }
}
