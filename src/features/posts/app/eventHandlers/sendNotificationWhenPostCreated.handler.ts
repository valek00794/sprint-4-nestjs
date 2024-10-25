import { IEventHandler, EventsHandler } from '@nestjs/cqrs';

import { PostCreatedEvent } from '../../domain/events/post-created.event';
import { TelegramAdapter } from 'src/infrastructure/adapters/telegram/telegram.adapter';
import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';
import { BlogsSubscriberInfoRepository } from 'src/features/blogs/infrastructure/blogs-subscriber-info.repository';
import { UsersTelegramInfoRepository } from 'src/features/users/infrastructure/users/users-telegram-info.repository';

@EventsHandler(PostCreatedEvent)
export class SendNotificationWhenPostCreatedHendler implements IEventHandler<PostCreatedEvent> {
  constructor(
    protected telegramAdapter: TelegramAdapter,
    protected usersTelegramInfoRepository: UsersTelegramInfoRepository,
    protected blogsRepository: BlogsRepository,
    protected blogsSubscriberInfoRepository: BlogsSubscriberInfoRepository,
  ) {}
  async handle(event: PostCreatedEvent) {
    const blog = await this.blogsRepository.findBlogById(event.blogId);
    const subscribers = await this.blogsSubscriberInfoRepository.getActiveSubscribersByBlogId(
      event.blogId,
    );
    if (blog && subscribers.length) {
      subscribers.forEach(async (sub) => {
        const telegramInfo = await this.usersTelegramInfoRepository.getUserTelegramInfo(sub.userId);
        if (telegramInfo) {
          this.telegramAdapter.sentMessage(
            `New post published for blog ${blog?.name}`,
            telegramInfo?.telegramId,
          );
        }
      });
    }
  }
}
