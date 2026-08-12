import { Injectable, NotFoundException } from '@nestjs/common';
import { Monitor } from './types/monitor.type';
import { CheckResult } from './types/check-result.type';
import { Incident } from './types/incident.type';
import { CreateMonitorDto } from './dto/create-monitor.dto';

const MAX_CHECK_RESULTS = 500;
const MAX_INCIDENTS = 200;
const CHECK_HISTORY_LIMIT = 50;
const INCIDENTS_LIMIT = 50;

@Injectable()
export class MonitorsService {
  private monitors: Monitor[] = [];
  private checkResults: CheckResult[] = [];
  private incidents: Incident[] = [];

  // ─── Monitor CRUD ────────────────────────────────────────────────────────

  findAll(): Monitor[] {
    return this.monitors;
  }

  findOne(id: string): Monitor {
    const monitor = this.monitors.find((m) => m.id === id);
    if (!monitor) {
      throw new NotFoundException(`Monitor with ID ${id} not found`);
    }
    return monitor;
  }

  create(createMonitorDto: CreateMonitorDto): Monitor {
    const newMonitor: Monitor = {
      id: Math.random().toString(36).substring(2, 9),
      name: createMonitorDto.name,
      url: createMonitorDto.url,
      intervalSeconds: createMonitorDto.intervalSeconds,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.monitors.push(newMonitor);
    return newMonitor;
  }

  remove(id: string): void {
    const index = this.monitors.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new NotFoundException(`Monitor with ID ${id} not found`);
    }
    this.monitors.splice(index, 1);
  }

  // ─── Check History ───────────────────────────────────────────────────────

  getCheckHistory(monitorId: string): CheckResult[] {
    this.findOne(monitorId);
    return this.checkResults
      .filter((cr) => cr.monitorId === monitorId)
      .sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime())
      .slice(0, CHECK_HISTORY_LIMIT);
  }

  // ─── Incident Queries ────────────────────────────────────────────────────

  getIncidents(): Incident[] {
    return this.incidents
      .slice()
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, INCIDENTS_LIMIT);
  }

  getMonitorIncidents(monitorId: string): Incident[] {
    this.findOne(monitorId);
    return this.incidents
      .filter((i) => i.monitorId === monitorId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, INCIDENTS_LIMIT);
  }

  // ─── Core Check Logic ────────────────────────────────────────────────────

  /**
   * Thực hiện HTTP check cho monitor, lưu kết quả và cập nhật incident.
   * Entry point cho cả thủ công lẫn scheduler.
   */
  async checkMonitorNow(id: string): Promise<Monitor> {
    const monitor = this.findOne(id);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const startTime = Date.now();
    const checkedAt = new Date().toISOString();

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

    // Cập nhật monitor state
    monitor.lastCheckedAt = checkedAt;
    monitor.lastStatus = newStatus;
    monitor.lastStatusCode = statusCode;
    monitor.lastResponseTimeMs = responseTimeMs!;
    monitor.lastError = newStatus === 'down' ? errorMsg : undefined;

    this.recordCheckResult(monitor, newStatus, statusCode, responseTimeMs!, checkedAt, errorMsg);
    this.updateIncidentState(monitor, newStatus, statusCode, errorMsg);

    return monitor;
  }

  /**
   * Lưu kết quả check vào checkResults[].
   * Giới hạn tổng cộng MAX_CHECK_RESULTS records.
   */
  private recordCheckResult(
    monitor: Monitor,
    status: 'up' | 'down',
    statusCode: number | undefined,
    responseTimeMs: number,
    checkedAt: string,
    error: string | undefined,
  ): void {
    const result: CheckResult = {
      id: Math.random().toString(36).substring(2, 9),
      monitorId: monitor.id,
      status,
      statusCode,
      responseTimeMs,
      checkedAt,
      error,
    };
    this.checkResults.push(result);

    // Trim để giữ in-memory hợp lý
    if (this.checkResults.length > MAX_CHECK_RESULTS) {
      this.checkResults.splice(0, this.checkResults.length - MAX_CHECK_RESULTS);
    }
  }

  /**
   * Cập nhật trạng thái incident theo kết quả check:
   * - up/unknown → down: tạo incident mới (open)
   * - down đang mở → down: không tạo thêm
   * - down → up: resolve incident open mới nhất
   * - up → up: không làm gì
   */
  private updateIncidentState(
    monitor: Monitor,
    newStatus: 'up' | 'down',
    lastStatusCode: number | undefined,
    lastError: string | undefined,
  ): void {
    const prevStatus = monitor.lastStatus; // đã được set bên trên, lấy từ history

    if (newStatus === 'down') {
      // Kiểm tra đã có incident open chưa
      const existingOpen = this.incidents.find(
        (i) => i.monitorId === monitor.id && i.status === 'open',
      );
      if (!existingOpen) {
        const incident: Incident = {
          id: Math.random().toString(36).substring(2, 9),
          monitorId: monitor.id,
          status: 'open',
          startedAt: new Date().toISOString(),
          reason: lastError || `HTTP Status: ${lastStatusCode ?? 'Unknown'}`,
          lastStatusCode,
          lastError,
        };
        this.incidents.push(incident);

        // Trim
        if (this.incidents.length > MAX_INCIDENTS) {
          this.incidents.splice(0, this.incidents.length - MAX_INCIDENTS);
        }
      }
    } else if (newStatus === 'up') {
      // Resolve incident open mới nhất (nếu có)
      const openIncidents = this.incidents
        .filter((i) => i.monitorId === monitor.id && i.status === 'open')
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

      if (openIncidents.length > 0) {
        openIncidents[0].status = 'resolved';
        openIncidents[0].resolvedAt = new Date().toISOString();
      }
    }
  }

  // ─── Scheduler Hook ──────────────────────────────────────────────────────

  /**
   * Quét tất cả monitors active và check nếu đến lịch.
   * Được gọi bởi MonitorsScheduler mỗi 10 giây.
   */
  async runDueChecks(): Promise<void> {
    const now = Date.now();
    const activeMonitors = this.monitors.filter((m) => m.isActive);

    for (const monitor of activeMonitors) {
      const lastChecked = monitor.lastCheckedAt
        ? new Date(monitor.lastCheckedAt).getTime()
        : 0;
      const elapsedSeconds = (now - lastChecked) / 1000;

      if (elapsedSeconds >= monitor.intervalSeconds) {
        // Fire-and-forget per monitor — lỗi không crash scheduler
        this.checkMonitorNow(monitor.id).catch((err) => {
          console.error(`[Scheduler] Error checking monitor ${monitor.id} (${monitor.url}):`, err?.message ?? err);
        });
      }
    }
  }
}
