import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyToken } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract token from Authorization Bearer header or cookies (__session / _session)
    const authHeader = request.headers?.authorization;
    const token =
      (authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null) ||
      request.cookies?.__session ||
      request.cookies?._session;

    if (!token) {
      this.logger.warn('Authentication failed: No token provided in request');
      throw new UnauthorizedException('Authentication token missing');
    }

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      this.logger.error('CLERK_SECRET_KEY is not defined in environment variables');
      throw new UnauthorizedException('Server auth configuration missing');
    }

    try {
      const payload = await verifyToken(token, {
        secretKey,
      } as Parameters<typeof verifyToken>[1]);

      // Attach verified payload to request.user
      request.user = payload;
      return true;
    } catch (error) {
      this.logger.error('Clerk authentication token verification failed:', error);
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }
}
