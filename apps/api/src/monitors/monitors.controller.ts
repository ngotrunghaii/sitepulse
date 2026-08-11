import { Controller, Get, Post, Delete, Param, Body, BadRequestException, HttpCode } from '@nestjs/common';
import { MonitorsService } from './monitors.service';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { Monitor } from './types/monitor.type';

@Controller('monitors')
export class MonitorsController {
  constructor(private readonly monitorsService: MonitorsService) {}

  @Get()
  findAll(): Monitor[] {
    return this.monitorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Monitor {
    return this.monitorsService.findOne(id);
  }

  @Post()
  create(@Body() createMonitorDto: CreateMonitorDto): Monitor {
    if (!createMonitorDto.name || createMonitorDto.name.trim() === '') {
      throw new BadRequestException('name must not be empty');
    }
    
    if (!createMonitorDto.url || (!createMonitorDto.url.startsWith('http://') && !createMonitorDto.url.startsWith('https://'))) {
      throw new BadRequestException('url must start with http:// or https://');
    }
    
    if (createMonitorDto.intervalSeconds === undefined || createMonitorDto.intervalSeconds < 60) {
      throw new BadRequestException('intervalSeconds must be at least 60');
    }

    return this.monitorsService.create(createMonitorDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): void {
    this.monitorsService.remove(id);
  }

  @Post(':id/check')
  async check(@Param('id') id: string): Promise<Monitor> {
    return this.monitorsService.checkMonitor(id);
  }

  @Get(':id/checks')
  getChecks(@Param('id') id: string) {
    return this.monitorsService.getCheckHistory(id);
  }
}
