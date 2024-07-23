import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { Like } from './likes.entity';
import { Comment } from 'src/features/comments/infrastructure/comments.entity';

@Unique('unique_author_comment', ['authorId', 'commentId'])
@Entity()
export class CommentsLike extends Like {
  @ManyToOne(() => Comment, (user) => user.likes, { nullable: true, cascade: true })
  @JoinColumn({ name: 'commentId' })
  comment: Comment;

  @Column()
  commentId: number;
}
