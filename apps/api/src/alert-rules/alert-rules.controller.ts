import { Controller, Get, Put, Body, Param, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { AlertRulesService } from './alert-rules.service';
import { UpdateAlertRuleDto } from './dto/update-alert-rule.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('monitors/:monitorId/alert-rule')
@UseGuards(JwtAuthGuard)
export class AlertRulesController {
  constructor(
    private readonly alertRulesService: AlertRulesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getAlertRule(@Param('monitorId') monitorId: string, @Request() req: any) {
    const userId = req.user.id;
    // Verify monitor ownership
    const monitor = await this.prisma.monitor.findFirst({
      where: { id: monitorId, userId },
    });
    if (!monitor) throw new NotFoundException('Monitor not found');

    return this.alertRulesService.getAlertRule(monitorId, userId);
  }

  @Put()
  async updateAlertRule(
    @Param('monitorId') monitorId: string,
    @Body() updateDto: UpdateAlertRuleDto,
    @Request() req: any
  ) {
    const userId = req.user.id;
    // Verify monitor ownership
    const monitor = await this.prisma.monitor.findFirst({
      where: { id: monitorId, userId },
    });
    if (!monitor) throw new NotFoundException('Monitor not found');

    return this.alertRulesService.upsertAlertRule(monitorId, userId, updateDto);
  }
}
