import {
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

class SaleItemDto {
  @IsNotEmpty()
  @IsUUID('4')
  productId: string;

  @IsNotEmpty()
  @Type(() => Number)
  quantityKg: number;
}

export enum PaymentMethodEnum {
  NAQD = 'NAQD',
  KARTA = 'KARTA',
  NASIYA = 'NASIYA',
}

export class CreateSaleDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsNotEmpty()
  @IsEnum(PaymentMethodEnum)
  paymentMethod: PaymentMethodEnum;

  @IsOptional()
  @IsUUID('4')
  customerId?: string;
}
