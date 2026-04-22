import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Foydalanuvchi emaili',
  })
  @IsString()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Foydalanuvchi paroli',
  })
  @IsString()
  password: string;
}
