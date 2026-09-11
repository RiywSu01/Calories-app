import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@ApiTags('User Profiles')
@ApiBearerAuth('clerk-auth')
@UseGuards(ClerkAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @Post()
  @ApiOperation({ summary: 'Create or initialize user biometric profile', description: 'Creates a user profile with BMR, TDEE, BMI, and macro targets' })
  @ApiResponse({ status: 201, description: 'Profile created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or profile already exists' })
  create(@Body() createProfileDto: CreateProfileDto) {
    return this.profileService.create(createProfileDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user profiles', description: 'Retrieves all user biometric profiles from database' })
  @ApiResponse({ status: 200, description: 'Profiles retrieved successfully' })
  findAll() {
    return this.profileService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile by User ID', description: 'Retrieves the complete biometric and calorie target profile for a user' })
  @ApiParam({ name: 'id', description: 'Clerk User ID', example: 'user_3HiYHDqKiD1ZBevdfWANDSJ5Eph' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  findOne(@Param('id') id: string) {
    return this.profileService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile and targets', description: 'Updates height, weight, activity level, goal mode, or custom calorie/macro targets' })
  @ApiParam({ name: 'id', description: 'Clerk User ID', example: 'user_3HiYHDqKiD1ZBevdfWANDSJ5Eph' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user profile', description: 'Deletes a user biometric profile record' })
  @ApiParam({ name: 'id', description: 'Clerk User ID', example: 'user_3HiYHDqKiD1ZBevdfWANDSJ5Eph' })
  @ApiResponse({ status: 200, description: 'Profile deleted successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  remove(@Param('id') id: string) {
    return this.profileService.remove(id);
  }
}
