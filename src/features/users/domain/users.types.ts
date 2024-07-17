import { UserEmailConfirmationInfo } from '../infrastructure/users/usersEmailConfirmationInfo.entity';

export class UserInfo {
  constructor(
    public userId: string,
    public login: string,
    public email?: string,
  ) {}
}

export type UserDeviceInfoType = {
  userId: number;
  deviceId: string;
  iat?: number;
  exp?: number;
};

export type UsersDevicesType = {
  deviceId: string;
  title: string;
  ip: string;
  userId: number;
  lastActiveDate?: Date;
  expiryDate?: Date;
};

export class UserEmailConfirmationInfoType {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
  userId?: number;
}

export class UserType {
  login: string;
  email: string;
  createdAt: string;
  passwordHash: string;
  emailConfirmation: UserEmailConfirmationInfo | null;
}

export class UsersRecoveryPassswordType {
  userId: number;
  expirationDate: Date;
  recoveryCode: string;
}
