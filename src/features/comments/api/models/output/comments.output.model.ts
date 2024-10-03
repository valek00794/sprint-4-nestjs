import type { CommentatorInfo } from 'src/features/comments/domain/comments.types';
import type { LikesInfoView } from 'src/features/likes/domain/likes.types';
import { PostInfoViewModel } from 'src/features/posts/api/models/output/posts.output.model';

export class CommentOutputModel {
  constructor(
    public id: string,
    public content: string,
    public commentatorInfo: CommentatorInfo,
    public createdAt: string,
    public likesInfo?: LikesInfoView,
    public postInfo?: PostInfoViewModel,
  ) {}
}
