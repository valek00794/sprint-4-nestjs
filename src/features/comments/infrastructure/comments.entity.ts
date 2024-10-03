import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Post } from 'src/features/posts/infrastructure/posts.entity';
import { User } from 'src/features/users/infrastructure/users/users.entity';
import { CommentsLike } from 'src/features/likes/infrastructure/commentsLikes.entity';
@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, collation: 'C' })
  content: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  createdAt: string;

  @ManyToOne(() => User, (user) => user.comments, { nullable: false, cascade: true })
  @JoinColumn({ name: 'commentatorId' })
  commenator: User;

  @ManyToOne(() => Post, (post) => post.comments, { nullable: false, cascade: true })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column()
  commentatorId: number;

  @Column()
  postId: number;

  @OneToMany(() => CommentsLike, (likes) => likes.comment)
  likes: CommentsLike[];
}
