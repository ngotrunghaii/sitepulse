import { Module } from '@nestjs/common';
import { MonitorsController } from './monitors.controller';
import { MonitorsService } from './monitors.service';
import { MonitorsScheduler } from './monitors.scheduler';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [MonitorsController],
  providers: [MonitorsService, MonitorsScheduler],
  exports: [MonitorsService],
})
export class MonitorsModule {}
