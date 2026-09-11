import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@ApiTags('Users')
@ApiBearerAuth('clerk-auth')
@UseGuards(ClerkAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @ApiOperation({ summary: 'Create or synchronize a user account', description: 'Creates a new user record in PostgreSQL' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or email/userId conflict' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all registered users (Admin/Authorized)', description: 'Retrieves all user records from the database' })
  @ApiResponse({ status: 200, description: 'List of users retrieved successfully' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details by User ID', description: 'Retrieves a single user record by their Clerk userId or primary key' })
  @ApiParam({ name: 'id', description: 'Clerk User ID (e.g. user_3Hi...)', example: 'user_3HiYHDqKiD1ZBevdfWANDSJ5Eph' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user account information', description: 'Updates user username, email, or role' })
  @ApiParam({ name: 'id', description: 'Clerk User ID', example: 'user_3HiYHDqKiD1ZBevdfWANDSJ5Eph' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user account', description: 'Deletes a user and cascades deletion of profile and logs' })
  @ApiParam({ name: 'id', description: 'Clerk User ID', example: 'user_3HiYHDqKiD1ZBevdfWANDSJ5Eph' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
