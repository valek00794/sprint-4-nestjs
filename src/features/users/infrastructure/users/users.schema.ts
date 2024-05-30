import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
export type UserDocument = HydratedDocument<User>;

@Schema()
export class UsersRecoveryPasssword {
  @Prop({ type: String, required: false })
  userId: string;

  @Prop({ type: Date, required: true })
  expirationDate: Date;

  @Prop({ type: String, required: true })
  recoveryCode: string;
}
export const usersRecoveryPassswordSchema = SchemaFactory.createForClass(UsersRecoveryPasssword);
export type UsersRecoveryPassswordDocument = HydratedDocument<UsersRecoveryPasssword>;
