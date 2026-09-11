import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({ summary: 'Root health & welcome check', description: 'Returns simple backend connection status string' })
  @ApiResponse({ status: 200, description: 'Service is healthy and reachable', schema: { example: 'Hello World!' } })
  getHello() {
    return this.appService.getHello();
  }

  @Get('health')
  @SkipThrottle()
  @ApiOperation({
    summary: 'Check API & PostgreSQL Database Health',
    description: 'Executes a live query ($queryRaw) against PostgreSQL to verify connectivity, measure latency, and return server uptime',
  })
  @ApiResponse({
    status: 200,
    description: 'Database is healthy and reachable',
    schema: {
      example: {
        status: 'ok',
        database: {
          status: 'up',
          connected: true,
          latencyMs: '4ms',
          dbTime: '2026-08-31T07:35:00.000Z',
        },
        service: 'calpal-backend',
        timestamp: '2026-08-31T07:35:00.000Z',
        uptimeSeconds: 1240,
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Database is down or unreachable',
    schema: {
      example: {
        status: 'error',
        database: {
          status: 'down',
          connected: false,
          latencyMs: '120ms',
          error: 'Connection terminated unexpectedly',
        },
        service: 'calpal-backend',
        timestamp: '2026-08-31T07:35:00.000Z',
      },
    },
  })
  getHealth() {
    return this.appService.getHealth();
  }
}
