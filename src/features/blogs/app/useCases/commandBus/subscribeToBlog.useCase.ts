import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { UsersRepository } from 'src/features/users/infrastructure/users/users.repository';
import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';
import { BlogsSubscriberInfoRepository } from 'src/features/blogs/infrastructure/blogs-subscriber-info.repository';
import { BlogSubscriberInfo } from 'src/features/blogs/infrastructure/blogs-subscriber-info.entity';
import { SubscriptionStatuses } from 'src/features/blogs/domain/subscriber.type';

export class SubscribeToBlogCommand {
  constructor(
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(SubscribeToBlogCommand)
export class SubscribeToBlogUseCase implements ICommandHandler<SubscribeToBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
    protected blogsSubscriberInfoRepository: BlogsSubscriberInfoRepository,
  ) {}

  async execute(command: SubscribeToBlogCommand) {
    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const blog = await this.blogsRepository.findBlogById(command.blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const subscribe = new BlogSubscriberInfo();
    subscribe.blogId = command.blogId;
    subscribe.userId = command.userId;
    subscribe.status = SubscriptionStatuses.Subscribed;
    subscribe.subscribeDate = new Date().toISOString();

    return await this.blogsSubscriberInfoRepository.saveSubscription(subscribe);
  }
}
