import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

export class PayDebtDto {
  @ApiProperty({
    example: 50000,
    description: 'To‘lov summasi (musbat son)',
  })
  @IsNotEmpty({ message: 'To‘lov summasi kiritilishi shart' })
  @IsNumber({}, { message: 'Summa raqam bo‘lishi kerak' })
  @IsPositive({ message: 'Summa musbat bo‘lishi kerak' })
  @Type(() => Number)
  amount: number;
}
