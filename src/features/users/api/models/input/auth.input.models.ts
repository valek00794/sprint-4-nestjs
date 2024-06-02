export type SignInModel = {
  loginOrEmail: string;
  password: string;
};

export type PasswordRecoveryModel = {
  newPassword: string;
  recoveryCode: string;
};
