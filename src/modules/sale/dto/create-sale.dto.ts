import {
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
  IsUUID,
  IsNumber,
} from 'class-validator';

import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SaleItemDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Product ID (UUID v4)',
  })
  @IsNotEmpty()
  @IsUUID('4')
  productId: string;

  @ApiProperty({
    example: 2.5,
    description: 'Mahsulot miqdori (kg)',
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  quantityKg: number;
}

export enum PaymentMethodEnum {
  NAQD = 'NAQD',
  KARTA = 'KARTA',
  NASIYA = 'NASIYA',
}

export class CreateSaleDto {
  @ApiProperty({
    type: [SaleItemDto],
    description: 'Sotuv mahsulotlari ro‘yxati',
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @ApiProperty({
    enum: PaymentMethodEnum,
    example: PaymentMethodEnum.NAQD,
    description: 'To‘lov turi',
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethodEnum)
  paymentMethod: PaymentMethodEnum;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Customer ID (agar nasiyaga bo‘lsa)',
  })
  @IsOptional()
  @IsUUID('4')
  customerId?: string;
}
