import {
  Controller,
  Get,
  Put,
  Body,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';

import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

// 👉 Swagger
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';

@ApiTags('Profile')
@ApiBearerAuth() // 🔐 JWT required
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile data' })
  async getProfile(@Req() req: Request) {
    const userId = req['userId'];
    return await this.profileService.getProfile(userId);
  }

  @Put()
  @ApiOperation({ summary: 'Update profile (with optional file)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Profile updated' })
  @UseInterceptors(FileInterceptor('file'))
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const userId = req['userId'];
    return await this.profileService.updateProfile(dto, file, userId);
  }

  @Put('password')
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed' })
  async changePassword(@Body() dto: ChangePasswordDto, @Req() req: Request) {
    const userId = req['userId'];
    return await this.profileService.changePassword(dto, userId);
  }

  @Put('photo')
  @ApiOperation({ summary: 'Update profile photo' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Photo updated' })
  @UseInterceptors(FileInterceptor('file'))
  async updatePhoto(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const userId = req['userId'];
    return await this.profileService.updatePhoto(file, userId);
  }
}
