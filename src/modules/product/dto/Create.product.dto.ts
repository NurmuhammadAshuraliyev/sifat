import { IsNotEmpty, IsString, IsNumber, IsPositive } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: 'Olma',
    description: 'Mahsulot nomi',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Meva',
    description: 'Mahsulot kategoriyasi',
  })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({
    example: 15000,
    description: '1 kg tannarx (cost price)',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  tannarx: number;

  @ApiProperty({
    example: 20000,
    description: '1 kg sotish narxi (selling price)',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  sotish: number;
}
