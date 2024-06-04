export class UsersDevicesOutput {
  constructor(
    public ip: string,
    public title: string,
    public deviceId: string,
    public lastActiveDate?: string,
  ) {}
}
