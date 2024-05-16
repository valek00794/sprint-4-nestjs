import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class UserEmailConfirmationInfo {
  @Prop({ required: true })
  confirmationCode: string;

  @Prop({ required: true })
  expirationDate: Date;

  @Prop({ required: true })
  isConfirmed: boolean;
}

export const UserEmailConfirmationInfoSchema =
  SchemaFactory.createForClass(UserEmailConfirmationInfo);

@Schema()
export class User {
  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  createdAt: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: UserEmailConfirmationInfoSchema, default: null })
  emailConfirmation: UserEmailConfirmationInfo | null;
}

export const UsersSchema = SchemaFactory.createForClass(User);
