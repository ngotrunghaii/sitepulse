import {
  Controller, Get, Post, Delete, Param, Body,
  BadRequestException, HttpCode,
} from '@nestjs/common';
import { MonitorsService } from './monitors.service';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { Monitor } from './types/monitor.type';
import { Incident } from './types/incident.type';
import { validateMonitorUrl } from '../common/security/url-security';

@Controller('monitors')
export class MonitorsController {
  constructor(private readonly monitorsService: MonitorsService) {}

  // ─── Incident routes (phải đặt trước :id để tránh route conflict) ────────

  @Get('incidents')
  async getAllIncidents(): Promise<Incident[]> {
    return this.monitorsService.getIncidents();
  }

  // ─── Monitor CRUD ─────────────────────────────────────────────────────────

  @Get()
  async findAll(): Promise<Monitor[]> {
    return this.monitorsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Monitor> {
    return this.monitorsService.findOne(id);
  }

  @Post()
  async create(@Body() createMonitorDto: CreateMonitorDto): Promise<Monitor> {
    if (!createMonitorDto.name || createMonitorDto.name.trim() === '') {
      throw new BadRequestException('name must not be empty');
    }

    // validateMonitorUrl kiểm tra protocol, SSRF, credentials — ném BadRequestException nếu không hợp lệ
    validateMonitorUrl(createMonitorDto.url ?? '');

    if (createMonitorDto.intervalSeconds === undefined || createMonitorDto.intervalSeconds < 60) {
      throw new BadRequestException('intervalSeconds must be at least 60');
    }

    return this.monitorsService.create(createMonitorDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    await this.monitorsService.remove(id);
  }

  // ─── Check & History ──────────────────────────────────────────────────────

  @Post(':id/check')
  async check(@Param('id') id: string): Promise<Monitor> {
    return this.monitorsService.checkMonitorNow(id);
  }

  @Get(':id/checks')
  async getChecks(@Param('id') id: string) {
    return this.monitorsService.getCheckHistory(id);
  }

  @Get(':id/incidents')
  async getMonitorIncidents(@Param('id') id: string): Promise<Incident[]> {
    return this.monitorsService.getMonitorIncidents(id);
  }
}
