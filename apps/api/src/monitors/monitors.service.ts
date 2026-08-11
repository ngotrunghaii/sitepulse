import { Injectable, NotFoundException } from '@nestjs/common';
import { Monitor } from './types/monitor.type';
import { CreateMonitorDto } from './dto/create-monitor.dto';

@Injectable()
export class MonitorsService {
  private monitors: Monitor[] = [];

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
}
