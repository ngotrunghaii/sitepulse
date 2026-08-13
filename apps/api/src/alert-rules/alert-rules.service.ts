import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAlertRuleDto } from './dto/update-alert-rule.dto';

@Injectable()
export class AlertRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAlertRule(monitorId: string, userId: string) {
    const rule = await this.prisma.alertRule.findUnique({
      where: { monitorId },
    });

    if (rule) return rule;

    // Default settings if not configured
    return {
      monitorId,
      enabled: true,
      email: '',
      failureThreshold: 1,
      notifyOnRecovery: true,
    };
  }

  async upsertAlertRule(monitorId: string, userId: string, data: UpdateAlertRuleDto) {
    return this.prisma.alertRule.upsert({
      where: { monitorId },
      update: {
        enabled: data.enabled,
        email: data.email,
        failureThreshold: data.failureThreshold,
        notifyOnRecovery: data.notifyOnRecovery,
      },
      create: {
        monitorId,
        userId,
        enabled: data.enabled,
        email: data.email,
        failureThreshold: data.failureThreshold,
        notifyOnRecovery: data.notifyOnRecovery,
      },
    });
  }
}
