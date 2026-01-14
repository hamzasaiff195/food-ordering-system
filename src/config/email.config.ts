import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export function createTransporter(configService: ConfigService) {
  const transporter = nodemailer.createTransport({
    host: configService.get<string>('EMAIL_HOST'),
    port: Number(configService.get<number>('EMAIL_PORT')),
    secure: false,
    auth: {
      user: configService.get<string>('EMAIL_USER'),
      pass: configService.get<string>('EMAIL_PASS'),
    },
  });

  return transporter;
}
