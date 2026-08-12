import * as dotenv from 'dotenv';
import { join } from 'path';
// Load .env từ root directory của monorepo BEFORE importing AppModule
dotenv.config({ path: join(__dirname, '../../../.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET environment variable is not defined.');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3001);
}
bootstrap();
