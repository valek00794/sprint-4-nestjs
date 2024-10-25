import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { BlogsSubscriberInfoRepository } from 'src/features/blogs/infrastructure/blogs-subscriber-info.repository';
import { SubscriptionStatuses } from 'src/features/blogs/domain/subscriber.type';

export class DeleteSubscriptionCommand {
  constructor(
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteSubscriptionCommand)
export class DeleteSubscriptionUseCase implements ICommandHandler<DeleteSubscriptionCommand> {
  constructor(protected blogsSubscriberInfoRepository: BlogsSubscriberInfoRepository) {}

  async execute(command: DeleteSubscriptionCommand) {
    const subscription = await this.blogsSubscriberInfoRepository.getSubscriberInfo(
      command.blogId,
      command.userId,
    );
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    subscription.status = SubscriptionStatuses.Unsubscribed;
    subscription.subscribeDate = new Date().toISOString();
    return await this.blogsSubscriberInfoRepository.saveSubscription(subscription);
  }
}
