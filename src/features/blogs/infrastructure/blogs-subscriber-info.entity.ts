import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { SubscriptionStatuses } from '../domain/subscriber.type';

@Entity()
@Unique(['userId', 'blogId'])
export class BlogSubscriberInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  blogId: string;

  @Column()
  userId: string;

  @Column()
  status: SubscriptionStatuses;

  @Column({ type: 'timestamp with time zone' })
  subscribeDate: string;
}
