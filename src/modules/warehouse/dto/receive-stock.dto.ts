import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  IsUUID,
} from 'class-validator';

import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReceiveStockDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Mahsulot ID (UUID v4)',
  })
  @IsNotEmpty({ message: 'Mahsulot ID si kiritilishi shart' })
  @IsString()
  @IsUUID('4', { message: 'Noto‘g‘ri mahsulot ID formati' })
  productId: string;

  @ApiProperty({
    example: 25,
    description: 'Qabul qilingan miqdor (kg)',
  })
  @IsNotEmpty({ message: 'Miqdor kiritilishi shart' })
  @IsNumber({}, { message: 'Miqdor raqam bo‘lishi kerak' })
  @IsPositive({ message: 'Miqdor musbat son bo‘lishi kerak' })
  @Type(() => Number)
  quantityKg: number;
}
