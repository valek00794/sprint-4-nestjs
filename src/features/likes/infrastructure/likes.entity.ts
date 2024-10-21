import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { LikeStatus } from '../domain/likes.types';
import { User } from 'src/features/users/infrastructure/users/users.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  status: LikeStatus;

  @Column({ type: 'timestamp with time zone', nullable: false })
  addedAt: string;

  @ManyToOne(() => User, (user) => user.likes, { nullable: true, cascade: true })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;
}
