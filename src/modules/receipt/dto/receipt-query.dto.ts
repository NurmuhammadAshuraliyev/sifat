import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReceiptQueryDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Sale ID (UUID v4)',
  })
  @IsNotEmpty({ message: 'Sale ID kiritilishi shart' })
  @IsUUID('4', { message: 'Noto‘g‘ri Sale ID formati' })
  saleId: string;
}
