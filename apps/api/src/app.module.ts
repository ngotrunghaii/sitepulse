import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MonitorsModule } from './monitors/monitors.module';

@Module({
  imports: [MonitorsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
