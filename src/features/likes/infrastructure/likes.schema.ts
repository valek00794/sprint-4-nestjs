import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LikeDocument = HydratedDocument<Like>;

@Schema()
export class Like {
  @Prop({ type: Types.ObjectId, required: true })
  parrentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  authorId: Types.ObjectId;

  @Prop({ type: String, required: true })
  authorLogin: string;

  @Prop({ type: String, required: true })
  status: string;

  @Prop({ type: Date, required: true })
  addedAt: Date;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
