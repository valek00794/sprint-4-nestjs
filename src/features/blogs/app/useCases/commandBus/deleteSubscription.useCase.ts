import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';

export class DeleteSubscriptionCommand {
  constructor(
    public blogId: string,
    public userId?: string,
  ) {}
}

@CommandHandler(DeleteSubscriptionCommand)
export class DeleteSubscriptionUseCase implements ICommandHandler<DeleteSubscriptionCommand> {
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(command: DeleteSubscriptionCommand) {
    const subscription = await this.blogsRepository.getSubscription(command.blogId);
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    await this.blogsRepository.deleteSubscription(command.blogId, command.userId);
  }
}
