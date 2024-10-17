import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { Like } from './likes.entity';
import { Post } from 'src/features/posts/infrastructure/posts.entity';

@Unique('unique_author_post', ['authorId', 'postId'])
@Entity()
export class PostsLike extends Like {
  @ManyToOne(() => Post, (user) => user.likes, { nullable: true, cascade: true })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column()
  postId: string;
}
