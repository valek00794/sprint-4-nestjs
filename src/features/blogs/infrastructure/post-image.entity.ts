import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { PostImageSize } from '../domain/blogs.types';

@Entity()
export class postImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  size: PostImageSize;

  @Column({ type: 'int' })
  postId: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  key: string;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  updatedAt: string;
}
