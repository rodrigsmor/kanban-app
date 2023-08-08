import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter<SentMessageInfo>;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAILER_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILER_USER || '',
        pass: process.env.MAILER_PASS || '',
      },
    });
  }

  async sendEmail(
    name: string,
    boardName: string,
    email: string,
    token: string,
    templatePath: string,
    subject?: string,
  ) {
    try {
      const template = fs.readFileSync(templatePath, 'utf-8');
      const compiledTemplate = handlebars.compile(template);
      const html = compiledTemplate({ name, boardName, token });

      await this.transporter.sendMail({
        from: process.env.MAILER_SENDER,
        to: email,
        subject: subject || 'Invitation to Join Board',
        html,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
