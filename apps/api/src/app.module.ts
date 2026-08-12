import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MonitorsModule } from './monitors/monitors.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule, MonitorsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
