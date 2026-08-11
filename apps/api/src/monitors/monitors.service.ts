import { Injectable, NotFoundException } from '@nestjs/common';
import { Monitor } from './types/monitor.type';
import { CheckResult } from './types/check-result.type';
import { CreateMonitorDto } from './dto/create-monitor.dto';

@Injectable()
export class MonitorsService {
  private monitors: Monitor[] = [];
  private checkResults: CheckResult[] = [];

  findAll(): Monitor[] {
    return this.monitors;
  }

  findOne(id: string): Monitor {
    const monitor = this.monitors.find(m => m.id === id);
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
    const index = this.monitors.findIndex(m => m.id === id);
    if (index === -1) {
      throw new NotFoundException(`Monitor with ID ${id} not found`);
    }
    this.monitors.splice(index, 1);
  }

  async checkMonitor(id: string): Promise<Monitor> {
    const monitor = this.findOne(id);
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const startTime = Date.now();
    monitor.lastCheckedAt = new Date().toISOString();
    
    try {
      const response = await fetch(monitor.url, {
        signal: controller.signal,
      });
      
      monitor.lastResponseTimeMs = Date.now() - startTime;
      monitor.lastStatusCode = response.status;
      
      if (response.status >= 200 && response.status <= 399) {
        monitor.lastStatus = 'up';
        monitor.lastError = undefined;
      } else {
        monitor.lastStatus = 'down';
        monitor.lastError = `HTTP Status: ${response.status}`;
      }
    } catch (error: any) {
      monitor.lastResponseTimeMs = Date.now() - startTime;
      monitor.lastStatus = 'down';
      monitor.lastStatusCode = undefined;
      monitor.lastError = error.name === 'AbortError' ? 'Request Timeout (5000ms)' : (error.message || 'Network Error');
    } finally {
      clearTimeout(timeout);
    }
    
    const checkResult: CheckResult = {
      id: Math.random().toString(36).substring(2, 9),
      monitorId: monitor.id,
      status: monitor.lastStatus as "up" | "down",
      statusCode: monitor.lastStatusCode,
      responseTimeMs: monitor.lastResponseTimeMs || 0,
      checkedAt: monitor.lastCheckedAt,
      error: monitor.lastError,
    };
    this.checkResults.push(checkResult);
    
    return monitor;
  }

  getCheckHistory(monitorId: string): CheckResult[] {
    // Ensure monitor exists
    this.findOne(monitorId);
    
    return this.checkResults
      .filter(cr => cr.monitorId === monitorId)
      .sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime())
      .slice(0, 10);
  }
}
