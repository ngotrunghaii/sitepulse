import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { MonitorsService } from './monitors.service';

const SCHEDULER_INTERVAL_MS = 10_000; // 10 giây

@Injectable()
export class MonitorsScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MonitorsScheduler.name);
  private intervalHandle: NodeJS.Timeout | null = null;

  constructor(private readonly monitorsService: MonitorsService) {}

  onModuleInit(): void {
    this.logger.log(`Auto-scheduler started — checking every ${SCHEDULER_INTERVAL_MS / 1000}s`);
    this.intervalHandle = setInterval(() => {
      this.monitorsService.runDueChecks().catch((err) => {
        this.logger.error('runDueChecks failed unexpectedly:', err?.message ?? err);
      });
    }, SCHEDULER_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
      this.logger.log('Auto-scheduler stopped');
    }
  }
}
