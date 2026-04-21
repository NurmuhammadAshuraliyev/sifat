import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class PayDebtDto {
  @IsNotEmpty({ message: 'To‘lov summasi kiritilishi shart' })
  @IsNumber({}, { message: 'Summa raqam bo‘lishi kerak' })
  @IsPositive({ message: 'Summa musbat bo‘lishi kerak' })
  @Type(() => Number)
  amount: number;
}
