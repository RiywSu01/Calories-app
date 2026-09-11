import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../generated/prisma/enums';

export class CreateUserDto {
  @ApiPropertyOptional({ description: 'Clerk User ID (e.g. user_2n...)', example: 'user_3HiYHDqKiD1ZBevdfWANDSJ5Eph' })
  userId?: string;

  @ApiProperty({ description: 'Unique user email address', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'User display handle / username', example: 'john_doe' })
  username: string;

  @ApiPropertyOptional({ enum: UserRole, description: 'User role permission', default: UserRole.user, example: UserRole.user })
  role?: UserRole;
}

