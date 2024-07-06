export class UserEmailConfirmationInfoEntity {
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
}

export class UserEntity {
  login: string;
  email: string;
  createdAt: string;
  passwordHash: string;
  id?: number;
}

export class UsersRecoveryPassswordEntity {
  userId: string;
  expirationDate: Date;
  recoveryCode: string;
}
