import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  async createIncidentOpenedNotification(
    userId: string,
    monitorId: string,
    incidentId: string,
    monitorName: string,
    recipientEmail: string,
  ): Promise<'sent' | 'skipped' | 'failed'> {
    const subject = `[SitePulse] Website đang gặp lỗi: ${monitorName}`;
    const text = `Hệ thống ghi nhận website ${monitorName} đang gặp sự cố. Vui lòng kiểm tra lại ngay!`;

    const result = await this.emailService.sendEmail(recipientEmail, subject, text);

    await this.prisma.notificationLog.create({
      data: {
        userId,
        monitorId,
        incidentId,
        type: 'incident_opened',
        recipient: recipientEmail,
        subject,
        status: result.status,
        errorMessage: result.errorMessage || result.reason,
        sentAt: result.status === 'sent' ? new Date() : null,
      },
    });

    return result.status as 'sent' | 'skipped' | 'failed';
  }

  async createIncidentResolvedNotification(
    userId: string,
    monitorId: string,
    incidentId: string,
    monitorName: string,
    recipientEmail: string,
  ): Promise<'sent' | 'skipped' | 'failed'> {
    const subject = `[SitePulse] Website đã hoạt động lại: ${monitorName}`;
    const text = `Tin vui! Website ${monitorName} đã hoạt động bình thường trở lại.`;

    const result = await this.emailService.sendEmail(recipientEmail, subject, text);

    await this.prisma.notificationLog.create({
      data: {
        userId,
        monitorId,
        incidentId,
        type: 'incident_resolved',
        recipient: recipientEmail,
        subject,
        status: result.status,
        errorMessage: result.errorMessage || result.reason,
        sentAt: result.status === 'sent' ? new Date() : null,
      },
    });

    return result.status as 'sent' | 'skipped' | 'failed';
  }

  async getNotificationLogs(userId: string) {
    return this.prisma.notificationLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
