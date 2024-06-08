import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, type Types } from 'mongoose';
import { CommentatorInfo } from '../domain/comments.types';

export type CommentsDocument = HydratedDocument<Comment>;

@Schema()
export class Comment {
  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  createdAt: string;

  @Prop({ type: CommentatorInfo, required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: String, required: false })
  postId: Types.ObjectId;
}

export const CommentsSchema = SchemaFactory.createForClass(Comment);
