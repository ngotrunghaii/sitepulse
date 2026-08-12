import {
  Controller, Get, Post, Delete, Param, Body,
  BadRequestException, HttpCode, UseGuards, Request,
} from '@nestjs/common';
import { MonitorsService } from './monitors.service';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { Monitor } from './types/monitor.type';
import { Incident } from './types/incident.type';
import { validateMonitorUrl } from '../common/security/url-security';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('monitors')
@UseGuards(JwtAuthGuard)
export class MonitorsController {
  constructor(private readonly monitorsService: MonitorsService) {}

  @Get('incidents')
  async getAllIncidents(@Request() req: any): Promise<Incident[]> {
    return this.monitorsService.getIncidents(req.user.id);
  }

  @Get()
  async findAll(@Request() req: any): Promise<Monitor[]> {
    return this.monitorsService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any): Promise<Monitor> {
    return this.monitorsService.findOne(id, req.user.id);
  }

  @Post()
  async create(@Body() createMonitorDto: CreateMonitorDto, @Request() req: any): Promise<Monitor> {
    if (!createMonitorDto.name || createMonitorDto.name.trim() === '') {
      throw new BadRequestException('name must not be empty');
    }

    validateMonitorUrl(createMonitorDto.url ?? '');

    if (createMonitorDto.intervalSeconds === undefined || createMonitorDto.intervalSeconds < 60) {
      throw new BadRequestException('intervalSeconds must be at least 60');
    }

    return this.monitorsService.create(createMonitorDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    await this.monitorsService.remove(id, req.user.id);
  }

  @Post(':id/check')
  async check(@Param('id') id: string, @Request() req: any): Promise<Monitor> {
    return this.monitorsService.checkMonitorNow(id, req.user.id);
  }

  @Get(':id/checks')
  async getChecks(@Param('id') id: string, @Request() req: any) {
    return this.monitorsService.getCheckHistory(id, req.user.id);
  }

  @Get(':id/incidents')
  async getMonitorIncidents(@Param('id') id: string, @Request() req: any): Promise<Incident[]> {
    return this.monitorsService.getMonitorIncidents(id, req.user.id);
  }
}
