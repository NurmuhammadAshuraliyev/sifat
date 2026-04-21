import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReceiveStockDto {
  @IsNotEmpty({ message: 'Mahsulot ID si kiritilishi shart' })
  @IsString()
  @IsUUID('4', { message: 'Noto‘g‘ri mahsulot ID formati' })
  productId: string;

  @IsNotEmpty({ message: 'Miqdor kiritilishi shart' })
  @IsNumber({}, { message: 'Miqdor raqam bo‘lishi kerak' })
  @IsPositive({ message: 'Miqdor musbat son bo‘lishi kerak' })
  @Type(() => Number)
  quantityKg: number;
}
