import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { BlogImageType } from '../domain/blogs.types';

@Entity()
export class BlogImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  type: BlogImageType;

  @Column({ type: 'int' })
  blogId: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  key: string;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  updatedAt: string;
}
