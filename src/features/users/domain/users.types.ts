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
