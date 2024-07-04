import type { CommentatorInfo } from 'src/features/comments/domain/comments.types';
import type { LikesInfoView } from 'src/features/likes/domain/likes.types';

export class CommentOutputModel {
  constructor(
    public id: number,
    public content: string,
    public commentatorInfo: CommentatorInfo,
    public createdAt: string,
    public likesInfo?: LikesInfoView,
    public postId?: number,
  ) {}
}
