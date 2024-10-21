import { UserEmailConfirmationInfo } from '../infrastructure/users/usersEmailConfirmationInfo.entity';

export class UserInfo {
  constructor(
    public userId: string,
    public login: string,
    public email?: string,
  ) {}
}

export type UserDeviceInfoType = {
  userId: string;
  deviceId: string;
  iat?: number;
  exp?: number;
};

export type UsersDevicesType = {
  deviceId: string;
  title: string;
  ip: string;
  userId: string;
  lastActiveDate?: Date;
  expiryDate?: Date;
};

export class UserEmailConfirmationInfoType {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
  userId?: string;
}

export class UserType {
  login: string;
  email: string;
  createdAt: string;
  passwordHash: string;
  emailConfirmation: UserEmailConfirmationInfo | null;
}

export class UsersRecoveryPassswordType {
  userId: string;
  expirationDate: Date;
  recoveryCode: string;
}
