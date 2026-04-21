// src/profile/profile.controller.ts
import {
  Controller,
  Get,
  Patch,
  Body,
  UsePipes,
  ValidationPipe,
  NotFoundException,
  Put,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@Req() req: Request) {
    const userId = req['userId'];
    return await this.profileService.getProfile(userId);
  }

  @Put()
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
  async changePassword(@Body() dto: ChangePasswordDto, @Req() req: Request) {
    const userId = req['userId'];
    return await this.profileService.changePassword(dto, userId);
  }

  @Put('photo')
  @UseInterceptors(FileInterceptor('file'))
  async updatePhoto(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const userId = req['userId'];
    return await this.profileService.updatePhoto(file, userId);
  }
}
