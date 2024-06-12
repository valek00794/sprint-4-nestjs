import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ApiRequestDocument = HydratedDocument<ApiRequest>;

@Schema()
export class ApiRequest {
  @Prop({ type: String, required: true })
  IP: string;

  @Prop({ type: String, required: true })
  URL: string;

  @Prop({ type: Date, required: true })
  date: Date;
}

export const ApiRequestsSchema = SchemaFactory.createForClass(ApiRequest);
