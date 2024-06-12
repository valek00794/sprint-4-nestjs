import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export const emailAdapter = {
  async send(
    email: string,
    subject: string,
    message: string,
  ): Promise<SMTPTransport.SentMessageInfo> {
    const transporter = nodemailer.createTransport({
      host: 'smtp.mail.ru',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.PASS_SENDER,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: `Backend project  <${process.env.EMAIL_SENDER}>`,
      to: email,
      subject: subject,
      html: message,
    });
    return info;
  },
};
