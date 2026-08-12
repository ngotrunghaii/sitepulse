import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MonitorsModule } from './monitors/monitors.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, MonitorsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
