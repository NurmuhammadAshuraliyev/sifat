import { IsNotEmpty, IsUUID } from 'class-validator';

export class ReceiptQueryDto {
  @IsNotEmpty({ message: 'Sale ID kiritilishi shart' })
  @IsUUID('4', { message: 'Noto‘g‘ri Sale ID formati' })
  saleId: string;
}
