import { Module } from '@nestjs/common';
import { MonitorsController } from './monitors.controller';
import { MonitorsService } from './monitors.service';
import { MonitorsScheduler } from './monitors.scheduler';

@Module({
  controllers: [MonitorsController],
  providers: [MonitorsService, MonitorsScheduler],
  exports: [MonitorsService],
})
export class MonitorsModule {}
