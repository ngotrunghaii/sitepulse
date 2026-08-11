import { Controller, Get } from '@nestjs/common';
import { HealthResponse } from '@sitepulse/shared';

@Controller()
export class AppController {
  constructor() {}

  @Get('health')
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'sitepulse-api'
    };
  }
}
