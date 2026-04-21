import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Prisma } from '@prisma/client';
import { S3Service } from 'src/core/storage/s3/s3.service';
import bcrypt from 'bcrypt';

@Injectable()
export class ProfileService {
  constructor(
    private readonly db: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async getProfile(userId: string) {
    const user = await this.db.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        photoUrl: true,
        // password ni qaytarmaymiz!
      },
    });

    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    return user;
  }

  async updateProfile(
    dto: UpdateProfileDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    const { fileName, url } = await this.s3Service.uploadFile(
      file,
      'profile_image',
    );

    const user = await this.db.prisma.user.update({
      where: { id: userId },
      data: { ...dto, photoUrl: fileName },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        photoUrl: true,
      },
    });

    return { success: true, message: 'Profil yangilandi', user };
  }

  async changePassword(dto: ChangePasswordDto, userId: string) {
    const user = await this.db.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    const comparePassword = await bcrypt.compare(
      dto.oldPassword,
      user.password,
    );

    if (!comparePassword) {
      throw new BadRequestException('Eski parol noto‘g‘ri');
    }

    const hashPassword = await bcrypt.hash(dto.newPassword, 12);

    await this.db.prisma.user.update({
      where: { id: userId },
      data: { password: hashPassword },
    });

    return { success: true, message: 'Parol muvaffaqiyatli o‘zgartirildi' };
  }

  // async updatePhoto(file: Express.Multer.File, userId: string) {
  //   const { fileName, url } = await this.s3Service.uploadFile(
  //     file,
  //     'profile_image',
  //   );
  //   const findId = await this.db.prisma.user.findUnique({
  //     where: { id: userId },
  //   });

  //   if (findId?.photoUrl) {
  //     await this.s3Service.deleteFile(findId?.photoUrl);
  //   }

  //   if (!findId) throw new ConflictException('Information notfount');

  //   const user = await this.db.prisma.user.update({
  //     where: { id: userId },
  //     data: { photoUrl: fileName },
  //     select: { id: true, photoUrl: true },
  //   });

  //   return { success: true, message: 'Rasm yuklandi', photoUrl: user.photoUrl };
  // }

  async updatePhoto(file: Express.Multer.File, userId: string) {
    const user = await this.db.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    // Eski rasmni o'chirish
    if (user.photoUrl) {
      console.log(
        'Old photoUrl from DB:',
        user.photoUrl.split('cloudfront.net/')[1],
      );

      await this.s3Service.deleteFile(
        user.photoUrl.split('cloudfront.net/')[1],
      );
    }

    // Yangi rasmni yuklash
    const { fileName } = await this.s3Service.uploadFile(file, 'profile_image');

    const updatedUser = await this.db.prisma.user.update({
      where: { id: userId },
      data: { photoUrl: fileName },
      select: { id: true, photoUrl: true },
    });

    return {
      success: true,
      message: 'Rasm muvaffaqiyatli yangilandi',
      photoUrl: updatedUser.photoUrl,
    };
  }
}
