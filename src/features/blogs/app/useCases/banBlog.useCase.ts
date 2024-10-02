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
    const blogId = Number(command.blogId);
    if (isNaN(blogId)) {
      throw new NotFoundException('BlogId syntax error');
    }
    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    if (!command.inputModel.isBanned) {
      await this.blogsRepository.unBanBlog(blogId);
    } else {
      await this.blogsRepository.banBlog(blogId);
    }
    return;
  }
}
