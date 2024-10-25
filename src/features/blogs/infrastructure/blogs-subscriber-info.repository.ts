import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BlogSubscriberInfo } from './blogs-subscriber-info.entity';
import { SubscriptionStatuses } from '../domain/subscriber.type';

@Injectable()
export class BlogsSubscriberInfoRepository {
  constructor(
    @InjectRepository(BlogSubscriberInfo)
    protected blogSubscriberInfoRepository: Repository<BlogSubscriberInfo>,
  ) {}

  async saveSubscription(subscribe: BlogSubscriberInfo) {
    const existingSubscription = await this.blogSubscriberInfoRepository.findOne({
      where: { userId: subscribe.userId, blogId: subscribe.blogId },
    });

    if (existingSubscription) {
      existingSubscription.status = subscribe.status;
      existingSubscription.subscribeDate = subscribe.subscribeDate;
      return await this.blogSubscriberInfoRepository.save(existingSubscription);
    } else {
      return await this.blogSubscriberInfoRepository.save(subscribe);
    }
  }

  async getSubscribersByBlogId(blogId: string): Promise<BlogSubscriberInfo[]> {
    return await this.blogSubscriberInfoRepository.find({ where: { blogId } });
  }

  async getActiveSubscribersByBlogId(blogId: string): Promise<BlogSubscriberInfo[]> {
    return await this.blogSubscriberInfoRepository.find({
      where: { blogId, status: SubscriptionStatuses.Subscribed },
    });
  }

  async getSubscriberInfo(blogId: string, userId?: string): Promise<BlogSubscriberInfo | null> {
    return await this.blogSubscriberInfoRepository.findOne({ where: { blogId, userId } });
  }
}
