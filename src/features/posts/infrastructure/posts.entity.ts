import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Blog } from 'src/features/blogs/infrastructure/blogs.entity';
@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  shortDescription: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  content: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  createdAt: string;

  @ManyToOne(() => Blog, (blog) => blog.posts, { nullable: false, cascade: true })
  @JoinColumn({ name: 'blogId' })
  blog: Blog;

  @Column()
  blogId: number;
}
