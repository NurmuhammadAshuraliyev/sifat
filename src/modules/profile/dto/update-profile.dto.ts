import { IsOptional, IsString, IsEmail, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Ali Valiyev',
    description: 'Foydalanuvchi to‘liq ismi',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    example: '+998901234567',
    description: 'Telefon raqam',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'Email manzil',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/photo.jpg',
    description: 'Profil rasmi URL',
  })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;
}
