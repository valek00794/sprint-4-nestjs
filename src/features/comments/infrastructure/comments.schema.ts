import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class Comment {
  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  createdAt: string;
}

export const CommentsSchema = SchemaFactory.createForClass(Comment);
