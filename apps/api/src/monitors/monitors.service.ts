import { Injectable, NotFoundException } from '@nestjs/common';
import { Monitor as MonitorDTO } from './types/monitor.type';
import { CheckResult as CheckResultDTO } from './types/check-result.type';
import { Incident as IncidentDTO } from './types/incident.type';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { validateMonitorUrl } from '../common/security/url-security';
import { PrismaService } from '../prisma/prisma.service';

const CHECK_HISTORY_LIMIT = 50;
const INCIDENTS_LIMIT = 50;

@Injectable()
export class MonitorsService {
  constructor(private prisma: PrismaService) {}

  // ─── Map Helpers ─────────────────────────────────────────────────────────

  private mapMonitor(m: any): MonitorDTO {
    // Determine lastStatus from the most recent check if not explicitly stored
    let lastStatus: 'up' | 'down' | 'unknown' = 'unknown';
    let lastStatusCode: number | undefined;
    let lastResponseTimeMs: number | undefined;
    let lastCheckedAt: string | undefined;
    let lastError: string | undefined;

    if (m.checks && m.checks.length > 0) {
      const latestCheck = m.checks[0];
      lastStatus = latestCheck.isUp ? 'up' : 'down';
      lastStatusCode = latestCheck.statusCode ?? undefined;
      lastResponseTimeMs = latestCheck.responseTime ?? undefined;
      lastCheckedAt = latestCheck.checkedAt.toISOString();
    }

    // Determine if there is an open incident
    const openIncident = m.incidents?.find((i: any) => i.resolvedAt === null);
    if (openIncident) {
      lastError = openIncident.description ?? undefined;
    }

    return {
      id: m.id,
      name: m.name,
      url: m.url,
      intervalSeconds: m.interval,
      isActive: true, // We assume true as the schema doesn't have isActive
      createdAt: m.createdAt.toISOString(),
      lastStatus,
      lastStatusCode,
      lastResponseTimeMs,
      lastCheckedAt,
      lastError,
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

  async findAll(): Promise<MonitorDTO[]> {
    const monitors = await this.prisma.monitor.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        checks: {
          orderBy: { checkedAt: 'desc' },
          take: 1,
        },
        incidents: {
          where: { resolvedAt: null },
          take: 1,
        },
      },
    });
    return monitors.map((m) => this.mapMonitor(m));
  }

  async findOne(id: string): Promise<MonitorDTO> {
    const monitor = await this.prisma.monitor.findUnique({
      where: { id },
      include: {
        checks: {
          orderBy: { checkedAt: 'desc' },
          take: 1,
        },
        incidents: {
          where: { resolvedAt: null },
          take: 1,
        },
      },
    });

    if (!monitor) {
      throw new NotFoundException(`Monitor with ID ${id} not found`);
    }

    return this.mapMonitor(monitor);
  }

  async create(createMonitorDto: CreateMonitorDto): Promise<MonitorDTO> {
    const monitor = await this.prisma.monitor.create({
      data: {
        name: createMonitorDto.name,
        url: createMonitorDto.url,
        interval: createMonitorDto.intervalSeconds,
        workspaceId: this.prisma.defaultWorkspaceId,
      },
    });
    return this.mapMonitor(monitor);
  }

  async remove(id: string): Promise<void> {
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

  async getCheckHistory(monitorId: string): Promise<CheckResultDTO[]> {
    const checks = await this.prisma.checkResult.findMany({
      where: { monitorId },
      orderBy: { checkedAt: 'desc' },
      take: CHECK_HISTORY_LIMIT,
    });
    return checks.map(this.mapCheckResult);
  }

  // ─── Incident Queries ────────────────────────────────────────────────────

  async getIncidents(): Promise<IncidentDTO[]> {
    const incidents = await this.prisma.incident.findMany({
      orderBy: { startedAt: 'desc' },
      take: INCIDENTS_LIMIT,
    });
    return incidents.map(this.mapIncident);
  }

  async getMonitorIncidents(monitorId: string): Promise<IncidentDTO[]> {
    const incidents = await this.prisma.incident.findMany({
      where: { monitorId },
      orderBy: { startedAt: 'desc' },
      take: INCIDENTS_LIMIT,
    });
    return incidents.map(this.mapIncident);
  }

  // ─── Core Check Logic ────────────────────────────────────────────────────

  async checkMonitorNow(id: string): Promise<MonitorDTO> {
    const monitor = await this.prisma.monitor.findUnique({
      where: { id },
    });

    if (!monitor) {
      throw new NotFoundException(`Monitor with ID ${id} not found`);
    }

    validateMonitorUrl(monitor.url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const startTime = Date.now();

    let newStatus: 'up' | 'down';
    let statusCode: number | undefined;
    let responseTimeMs: number;
    let errorMsg: string | undefined;

    try {
      const response = await fetch(monitor.url, { signal: controller.signal });
      responseTimeMs = Date.now() - startTime;
      statusCode = response.status;

      if (response.status >= 200 && response.status <= 399) {
        newStatus = 'up';
      } else {
        newStatus = 'down';
        errorMsg = `HTTP Status: ${response.status}`;
      }
    } catch (error: any) {
      responseTimeMs = Date.now() - startTime;
      newStatus = 'down';
      statusCode = undefined;
      errorMsg =
        error.name === 'AbortError'
          ? 'Request Timeout (5000ms)'
          : error.message || 'Network Error';
    } finally {
      clearTimeout(timeout);
    }

    await this.recordCheckResult(monitor.id, newStatus, statusCode, responseTimeMs);
    await this.updateIncidentState(monitor.id, newStatus, statusCode, errorMsg);

    return this.findOne(monitor.id);
  }

  private async recordCheckResult(
    monitorId: string,
    status: 'up' | 'down',
    statusCode: number | undefined,
    responseTimeMs: number,
  ): Promise<void> {
    await this.prisma.checkResult.create({
      data: {
        monitorId,
        isUp: status === 'up',
        statusCode,
        responseTime: responseTimeMs,
      },
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
      const idsToDelete = oldChecks.map((c) => c.id);
      await this.prisma.checkResult.deleteMany({
        where: { id: { in: idsToDelete } },
      });
    }
  }

  private async updateIncidentState(
    monitorId: string,
    newStatus: 'up' | 'down',
    lastStatusCode: number | undefined,
    lastError: string | undefined,
  ): Promise<void> {
    const existingOpen = await this.prisma.incident.findFirst({
      where: { monitorId, resolvedAt: null },
      orderBy: { startedAt: 'desc' },
    });

    if (newStatus === 'down') {
      if (!existingOpen) {
        await this.prisma.incident.create({
          data: {
            monitorId,
            description: lastError || `HTTP Status: ${lastStatusCode ?? 'Unknown'}`,
          },
        });
      }
    } else if (newStatus === 'up') {
      if (existingOpen) {
        await this.prisma.incident.update({
          where: { id: existingOpen.id },
          data: {
            resolvedAt: new Date(),
          },
        });
      }
    }
  }

  async runDueChecks(): Promise<void> {
    // Get all monitors, with their latest check result
    const monitors = await this.prisma.monitor.findMany({
      include: {
        checks: {
          orderBy: { checkedAt: 'desc' },
          take: 1,
        },
      },
    });
    
    const now = Date.now();

    for (const monitor of monitors) {
      const lastCheckedAt = monitor.checks.length > 0 ? monitor.checks[0].checkedAt.getTime() : 0;
      const elapsedSeconds = (now - lastCheckedAt) / 1000;

      if (elapsedSeconds >= monitor.interval) {
        this.checkMonitorNow(monitor.id).catch((err) => {
          console.error(`[Scheduler] Error checking monitor ${monitor.id} (${monitor.url}):`, err?.message ?? err);
        });
      }
    }
  }
}
