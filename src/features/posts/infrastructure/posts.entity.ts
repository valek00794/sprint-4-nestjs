import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Comment } from 'src/features/comments/infrastructure/comments.entity';
import { Blog } from 'src/features/blogs/infrastructure/blogs.entity';
import { PostsLike } from 'src/features/likes/infrastructure/postslikes.entity';
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

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => PostsLike, (likes) => likes.post)
  likes: PostsLike[];
}
