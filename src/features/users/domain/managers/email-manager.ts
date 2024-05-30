import { emailAdapter } from '../../../../infrastructure/adapters/email.adapter';

export const emailManager = {
  async sendEmailConfirmationMessage(email: string, code: string) {
    const subject = 'Email confirmation';
    const message = `<h1>Thank for your registration</h1>
        <p>To finish registration please follow the link below:
        <a href=\'https://somesite.com/auth/registration-confirmation?code=${code}\'> complete registration</a></p>`;
    emailAdapter.send(email, subject, message);
  },
  async sendEmailPasswordRecoveryMessage(email: string, recoveryCode: string) {
    const subject = 'Password recovery';
    const message = ` <h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
           <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
       </p>`;
    emailAdapter.send(email, subject, message);
  },
};
