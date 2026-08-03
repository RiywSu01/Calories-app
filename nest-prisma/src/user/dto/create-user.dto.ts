import { UserRole } from '../../generated/prisma/enums';

export class CreateUserDto {
  email: string;
  username: string;
  role?: UserRole;
}
