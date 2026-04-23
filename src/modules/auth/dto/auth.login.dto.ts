import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLoginDto {
  @ApiProperty({
    example: 'alisher@goshtpro.uz',
    description: 'Foydalanuvchi emaili',
  })
  @IsString()
  email: string;

  @ApiProperty({
    example: '12345',
    description: 'Foydalanuvchi paroli',
  })
  @IsString()
  password: string;
}
