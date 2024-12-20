import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { User } from '../users/user.entity';
import { Blog } from 'src/features/blogs/infrastructure/blogs.entity';

@Entity()
export class UsersBanInfoForBlogs {
  @ManyToOne(() => Blog, { nullable: false })
  @JoinColumn({ name: 'blogId' })
  blog: Blog;

  @PrimaryColumn()
  blogId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  bannedUser: User;

  @PrimaryColumn()
  userId: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  banDate: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  banReason: string;

  @Column({ type: 'boolean', default: false })
  isBanned: boolean;
}
