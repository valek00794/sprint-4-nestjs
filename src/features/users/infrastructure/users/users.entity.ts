export class UserEmailConfirmationInfo {
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
}

export class User {
  login: string;
  email: string;
  createdAt: string;
  passwordHash: string;
  id?: number;
}

export class UsersRecoveryPasssword {
  userId: string;
  expirationDate: Date;
  recoveryCode: string;
}
