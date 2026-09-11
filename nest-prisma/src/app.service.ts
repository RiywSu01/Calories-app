import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHello() {
    return 'Hello, World!';
  }

  /**
   * Performs an active health check against the PostgreSQL database
   * Measures connection latency and returns database timestamp
   */
  async getHealth() {
    const startTime = Date.now();
    try {
      // Execute a live query to verify database read/connection status
      const queryResult: any = await this.prisma.$queryRaw`SELECT 1 AS ping, NOW() AS db_time`;
      const latencyMs = Date.now() - startTime;

      return {
        status: 'ok',
        database: {
          status: 'up',
          connected: true,
          latencyMs: `${latencyMs}ms`,
          dbTime: queryResult?.[0]?.db_time || new Date().toISOString(),
        },
        service: 'calpal-backend',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
      };
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      throw new HttpException(
        {
          status: 'error',
          database: {
            status: 'down',
            connected: false,
            latencyMs: `${latencyMs}ms`,
            error: error.message || 'Database query failed or connection timed out',
          },
          service: 'calpal-backend',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
