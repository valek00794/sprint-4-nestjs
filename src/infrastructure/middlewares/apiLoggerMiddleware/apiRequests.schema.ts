import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ApiRequestsDocument = HydratedDocument<ApiRequests>;

@Schema()
export class ApiRequests {
  @Prop({ type: String, required: true })
  IP: string;

  @Prop({ type: String, required: true })
  URL: string;

  @Prop({ type: Date, required: true })
  date: Date;
}

export const ApiRequestsSchema = SchemaFactory.createForClass(ApiRequests);
