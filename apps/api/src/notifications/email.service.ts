import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      this.logger.warn('SMTP configuration is missing. Email notifications will be skipped.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10),
      secure: parseInt(SMTP_PORT, 10) === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    this.isConfigured = true;
    this.logger.log('SMTP configuration loaded successfully.');
  }

  async sendEmail(to: string, subject: string, text: string): Promise<{ status: string; reason?: string; errorMessage?: string }> {
    if (!this.isConfigured || !this.transporter) {
      return { status: 'skipped', reason: 'SMTP is not configured' };
    }

    const from = process.env.SMTP_FROM || '"SitePulse" <no-reply@sitepulse.local>';

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
      });
      return { status: 'sent' };
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      return { status: 'failed', errorMessage: error.message };
    }
  }
}
