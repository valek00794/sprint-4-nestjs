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
  userId?: string;
  lastActiveDate?: string;
  expiryDate?: string;
};

export class UserEmailConfirmationInfoType {
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
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
  expirationDate: string;
  recoveryCode: string;
}
