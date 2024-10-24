import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BlogSubscriberInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  blogId: string;

  @Column()
  userId: string;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  subscribeDate: string;
}
