import { Injectable, NotFoundException } from '@nestjs/common';
import { Monitor as MonitorDTO } from './types/monitor.type';
import { CheckResult as CheckResultDTO } from './types/check-result.type';
import { Incident as IncidentDTO } from './types/incident.type';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { validateMonitorUrl } from '../common/security/url-security';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

const CHECK_HISTORY_LIMIT = 50;
const INCIDENTS_LIMIT = 50;
const MAX_ATTEMPTS = 2;       // retry once before giving up
const RETRY_DELAY_MS = 500;   // wait 500ms between attempts

// ─── Error message helpers ────────────────────────────────────────────────────

/**
 * Map raw HTTP status codes / error strings to a friendlier Vietnamese message
 * that appears in the monitor detail and incidents.
 */
function friendlyErrorMessage(statusCode: number | undefined, rawError: string | undefined): string {
  if (statusCode === 521 || statusCode === 522 || statusCode === 523 || statusCode === 527 || statusCode === 530) {
    return 'Máy chủ SitePulse không truy cập được website này';
  }
  if (rawError && rawError.toLowerCase().includes('timeout')) {
    return 'Máy chủ SitePulse không truy cập được website này';
  }
  if (statusCode !== undefined && statusCode >= 400 && statusCode <= 499) {
    return `Lỗi phía client (HTTP ${statusCode})`;
  }
  if (statusCode !== undefined && statusCode >= 500 && statusCode <= 599) {
    return `Lỗi máy chủ (HTTP ${statusCode})`;
  }
  return rawError || 'Lỗi mạng';
}

@Injectable()
export class MonitorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ─── Map Helpers ─────────────────────────────────────────────────────────

  private mapMonitor(m: any): MonitorDTO {
    return {
      id: m.id,
      name: m.name,
      url: m.url,
      intervalSeconds: m.interval,
      isActive: true,
      createdAt: m.createdAt.toISOString(),
      lastStatus: (m.lastStatus as 'up' | 'down' | 'unknown') || 'unknown',
      lastStatusCode: m.lastStatusCode ?? undefined,
      lastResponseTimeMs: m.lastResponseTimeMs ?? undefined,
      lastCheckedAt: m.lastCheckedAt ? m.lastCheckedAt.toISOString() : undefined,
      lastError: m.lastErrorMessage ?? undefined,
      consecutiveFailures: m.consecutiveFailures ?? 0,
      consecutiveSuccesses: m.consecutiveSuccesses ?? 0,
    };
  }

  private mapCheckResult(cr: any): CheckResultDTO {
    return {
      id: cr.id,
      monitorId: cr.monitorId,
      status: cr.isUp ? 'up' : 'down',
      statusCode: cr.statusCode ?? undefined,
      responseTimeMs: cr.responseTime ?? 0,
      checkedAt: cr.checkedAt.toISOString(),
      error: cr.errorReason ?? undefined,
      attemptCount: cr.attemptCount ?? 1,
      errorReason: cr.errorReason ?? undefined,
    };
  }

  private mapIncident(inc: any): IncidentDTO {
    return {
      id: inc.id,
      monitorId: inc.monitorId,
      status: inc.resolvedAt ? 'resolved' : 'open',
      startedAt: inc.startedAt.toISOString(),
      resolvedAt: inc.resolvedAt?.toISOString(),
      reason: inc.description || 'Unknown error',
    };
  }

  // ─── Monitor CRUD ────────────────────────────────────────────────────────

  async findAll(userId: string): Promise<MonitorDTO[]> {
    const monitors = await this.prisma.monitor.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return monitors.map((m) => this.mapMonitor(m));
  }

  async findOne(id: string, userId?: string): Promise<MonitorDTO> {
    const monitor = await this.prisma.monitor.findFirst({
      where: userId ? { id, userId } : { id },
    });

    if (!monitor) {
      throw new NotFoundException(`Monitor with ID ${id} not found`);
    }

    return this.mapMonitor(monitor);
  }

  async create(createMonitorDto: CreateMonitorDto, userId: string): Promise<MonitorDTO> {
    const monitor = await this.prisma.monitor.create({
      data: {
        name: createMonitorDto.name,
        url: createMonitorDto.url,
        interval: createMonitorDto.intervalSeconds,
        workspaceId: this.prisma.defaultWorkspaceId,
        userId,
      },
    });
    return this.mapMonitor(monitor);
  }

  async remove(id: string, userId: string): Promise<void> {
    const monitor = await this.prisma.monitor.findFirst({ where: { id, userId } });
    if (!monitor) throw new NotFoundException(`Monitor with ID ${id} not found`);

    try {
      await this.prisma.$transaction([
        this.prisma.checkResult.deleteMany({ where: { monitorId: id } }),
        this.prisma.incident.deleteMany({ where: { monitorId: id } }),
        this.prisma.monitor.delete({ where: { id } }),
      ]);
    } catch (e: any) {
      if (e.code === 'P2025') {
        throw new NotFoundException(`Monitor with ID ${id} not found`);
      }
      throw e;
    }
  }

  // ─── Check History ───────────────────────────────────────────────────────

  async getCheckHistory(monitorId: string, userId: string): Promise<CheckResultDTO[]> {
    const monitor = await this.prisma.monitor.findFirst({ where: { id: monitorId, userId } });
    if (!monitor) throw new NotFoundException(`Monitor with ID ${monitorId} not found`);

    const checks = await this.prisma.checkResult.findMany({
      where: { monitorId },
      orderBy: { checkedAt: 'desc' },
      take: CHECK_HISTORY_LIMIT,
    });
    return checks.map(cr => this.mapCheckResult(cr));
  }

  // ─── Incident Queries ────────────────────────────────────────────────────

  async getIncidents(userId: string): Promise<IncidentDTO[]> {
    const incidents = await this.prisma.incident.findMany({
      where: { monitor: { userId } },
      orderBy: { startedAt: 'desc' },
      take: INCIDENTS_LIMIT,
    });
    return incidents.map(this.mapIncident);
  }

  async getMonitorIncidents(monitorId: string, userId: string): Promise<IncidentDTO[]> {
    const monitor = await this.prisma.monitor.findFirst({ where: { id: monitorId, userId } });
    if (!monitor) throw new NotFoundException(`Monitor with ID ${monitorId} not found`);

    const incidents = await this.prisma.incident.findMany({
      where: { monitorId },
      orderBy: { startedAt: 'desc' },
      take: INCIDENTS_LIMIT,
    });
    return incidents.map(this.mapIncident);
  }

  // ─── HTTP Attempt ────────────────────────────────────────────────────────

  /**
   * Perform a single HTTP attempt against the given URL.
   * Returns the result of that one attempt.
   */
  private async performHttpAttempt(url: string): Promise<{
    isUp: boolean;
    statusCode: number | undefined;
    responseTimeMs: number;
    errorMsg: string | undefined;
  }> {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), 10_000);
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'SitePulse/1.0 (+https://github.com/ngotrunghaii/sitepulse)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      const responseTimeMs = Date.now() - startTime;
      const statusCode = response.status;

      if (statusCode >= 200 && statusCode <= 399) {
        return { isUp: true, statusCode, responseTimeMs, errorMsg: undefined };
      }
      const rawError = `HTTP ${statusCode}`;
      return {
        isUp: false,
        statusCode,
        responseTimeMs,
        errorMsg: friendlyErrorMessage(statusCode, rawError),
      };
    } catch (error: any) {
      const responseTimeMs = Date.now() - startTime;
      const rawError: string =
        error.name === 'AbortError' ? 'Request Timeout (10000ms)' : (error.message || 'Network Error');
      return {
        isUp: false,
        statusCode: undefined,
        responseTimeMs,
        errorMsg: friendlyErrorMessage(undefined, rawError),
      };
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  // ─── Core Check Logic ────────────────────────────────────────────────────

  async checkMonitorNow(id: string, userId?: string): Promise<MonitorDTO> {
    // Fetch monitor with current consecutive counters
    const monitor = await this.prisma.monitor.findFirst({
      where: userId ? { id, userId } : { id },
    });

    if (!monitor) {
      throw new NotFoundException(`Monitor with ID ${id} not found`);
    }

    validateMonitorUrl(monitor.url);

    // ── Retry loop ──────────────────────────────────────────────────────
    let finalResult: { isUp: boolean; statusCode: number | undefined; responseTimeMs: number; errorMsg: string | undefined };
    let attemptCount = 0;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      attemptCount = attempt;
      finalResult = await this.performHttpAttempt(monitor.url);

      if (finalResult.isUp) {
        // Succeeded — no more attempts needed
        break;
      }

      if (attempt < MAX_ATTEMPTS) {
        // Brief pause before retrying
        await new Promise<void>((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }

    const { isUp, statusCode, responseTimeMs, errorMsg } = finalResult!;

    // ── Fetch alert rule for failureThreshold ───────────────────────────
    const alertRule = await this.prisma.alertRule.findUnique({ where: { monitorId: id } });
    const failureThreshold = alertRule?.failureThreshold ?? 1;

    // ── Compute new consecutive counters ────────────────────────────────
    const currentFailures: number = (monitor as any).consecutiveFailures ?? 0;
    const currentSuccesses: number = (monitor as any).consecutiveSuccesses ?? 0;

    let newConsecutiveFailures: number;
    let newConsecutiveSuccesses: number;
    let newLastStatus: string;
    let isWarning = false;  // sub-threshold DOWN — don't flip monitor status yet

    if (isUp) {
      newConsecutiveFailures = 0;
      newConsecutiveSuccesses = currentSuccesses + 1;
      newLastStatus = 'up';
    } else {
      newConsecutiveFailures = currentFailures + 1;
      newConsecutiveSuccesses = 0;

      if (newConsecutiveFailures >= failureThreshold) {
        newLastStatus = 'down';
      } else {
        // Below threshold — preserve existing status, mark as warning internally
        newLastStatus = (monitor as any).lastStatus || 'unknown';
        isWarning = true;
      }
    }

    // ── Persist check result ─────────────────────────────────────────────
    await this.recordCheckResult(
      monitor.id,
      isUp,
      statusCode,
      responseTimeMs,
      attemptCount,
      errorMsg,
    );

    // ── Update monitor row ───────────────────────────────────────────────
    await this.prisma.monitor.update({
      where: { id: monitor.id },
      data: {
        lastStatus: newLastStatus,
        lastStatusCode: isUp ? (statusCode ?? null) : (statusCode ?? (monitor as any).lastStatusCode ?? null),
        lastResponseTimeMs: isUp ? responseTimeMs : ((monitor as any).lastResponseTimeMs ?? null),
        lastCheckedAt: new Date(),
        lastErrorMessage: isUp ? null : (errorMsg ?? null),
        consecutiveFailures: newConsecutiveFailures,
        consecutiveSuccesses: newConsecutiveSuccesses,
      } as any,
    });

    // ── Incident management ──────────────────────────────────────────────
    await this.updateIncidentState(
      monitor.id,
      monitor.name,
      monitor.userId,
      isUp,
      isWarning,
      newConsecutiveFailures,
      failureThreshold,
      alertRule,
      statusCode,
      errorMsg,
    );

    return this.findOne(monitor.id);
  }

  private async recordCheckResult(
    monitorId: string,
    isUp: boolean,
    statusCode: number | undefined,
    responseTimeMs: number,
    attemptCount: number,
    errorReason: string | undefined,
  ): Promise<void> {
    await this.prisma.checkResult.create({
      data: {
        monitorId,
        isUp,
        statusCode,
        responseTime: responseTimeMs,
        attemptCount,
        errorReason: errorReason ?? null,
      } as any,
    });

    // Cleanup old checks to prevent infinite growth
    const totalChecks = await this.prisma.checkResult.count({ where: { monitorId } });
    if (totalChecks > 500) {
      const oldChecks = await this.prisma.checkResult.findMany({
        where: { monitorId },
        orderBy: { checkedAt: 'desc' },
        skip: 500,
        select: { id: true },
      });
      await this.prisma.checkResult.deleteMany({
        where: { id: { in: oldChecks.map((c) => c.id) } },
      });
    }
  }

  private async updateIncidentState(
    monitorId: string,
    monitorName: string,
    userId: string,
    isUp: boolean,
    isWarning: boolean,
    consecutiveFailures: number,
    failureThreshold: number,
    alertRule: any,
    lastStatusCode: number | undefined,
    lastError: string | undefined,
  ): Promise<void> {
    const existingOpen = await this.prisma.incident.findFirst({
      where: { monitorId, resolvedAt: null },
      orderBy: { startedAt: 'desc' },
    });

    if (!isUp && !isWarning) {
      // ── True DOWN (threshold reached) — open or notify existing incident ──
      if (consecutiveFailures >= failureThreshold) {
        let currentIncident = existingOpen;

        if (!currentIncident) {
          // Only open a new incident if none is open
          currentIncident = await this.prisma.incident.create({
            data: {
              monitorId,
              description: lastError || `HTTP Status: ${lastStatusCode ?? 'Unknown'}`,
            },
          });
        }

        // Send notification if not yet notified
        if (!currentIncident.notifiedAt && alertRule?.enabled && alertRule.email) {
          const status = await this.notificationsService.createIncidentOpenedNotification(
            userId,
            monitorId,
            currentIncident.id,
            monitorName,
            alertRule.email,
          );

          if (status === 'sent' || status === 'skipped') {
            await this.prisma.incident.update({
              where: { id: currentIncident.id },
              data: { notifiedAt: new Date() },
            });
          }
        }
      }
      // If below threshold (isWarning=false here shouldn't happen, but be safe): do nothing
    } else if (isUp) {
      // ── UP — resolve any open incident ───────────────────────────────
      if (existingOpen) {
        const updateData: any = { resolvedAt: new Date() };

        if (existingOpen.notifiedAt && !existingOpen.resolvedNotifiedAt && alertRule?.notifyOnRecovery && alertRule.email) {
          const status = await this.notificationsService.createIncidentResolvedNotification(
            userId,
            monitorId,
            existingOpen.id,
            monitorName,
            alertRule.email,
          );

          if (status === 'sent' || status === 'skipped') {
            updateData.resolvedNotifiedAt = new Date();
          }
        }

        await this.prisma.incident.update({
          where: { id: existingOpen.id },
          data: updateData,
        });
      }
    }
    // isWarning=true: sub-threshold failure, do not touch incidents
  }

  async runDueChecks(): Promise<void> {
    const monitors = await this.prisma.monitor.findMany({
      select: {
        id: true,
        url: true,
        interval: true,
        lastCheckedAt: true,
      },
    });

    const now = Date.now();

    for (const monitor of monitors) {
      const lastCheckedAt = monitor.lastCheckedAt ? monitor.lastCheckedAt.getTime() : 0;
      const elapsedSeconds = (now - lastCheckedAt) / 1000;

      if (elapsedSeconds >= monitor.interval) {
        this.checkMonitorNow(monitor.id).catch((err) => {
          console.error(`[Scheduler] Error checking monitor ${monitor.id} (${monitor.url}):`, err?.message ?? err);
        });
      }
    }
  }
}
