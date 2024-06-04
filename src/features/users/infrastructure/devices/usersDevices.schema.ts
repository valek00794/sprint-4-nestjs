import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class UsersDevices {
  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: String, required: false })
  userId: string;

  @Prop({ type: String, required: false })
  lastActiveDate: string;

  @Prop({ type: String, required: false })
  expiryDate: string;
}
export const UsersDevicesSchema = SchemaFactory.createForClass(UsersDevices);
export type UsersDevicesDocument = HydratedDocument<UsersDevices>;
