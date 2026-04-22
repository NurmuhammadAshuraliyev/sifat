import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({
    example: 'Ali Valiyev',
    description: 'Mijoz ismi',
  })
  @IsNotEmpty({ message: 'Mijoz ismi kiritilishi shart' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: '+998901234567',
    description: 'Mijoz telefon raqami (UZ format)',
  })
  @IsOptional()
  @IsPhoneNumber('UZ', { message: 'Noto‘g‘ri telefon raqami formati' })
  phone?: string;
}
