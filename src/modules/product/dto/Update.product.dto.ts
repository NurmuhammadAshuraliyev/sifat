import { IsOptional, IsString, IsNumber, IsPositive } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({
    example: 'Olma',
    description: 'Mahsulot nomi',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Meva',
    description: 'Mahsulot kategoriyasi',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: 15000,
    description: '1 kg tannarx',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  tannarx?: number;

  @ApiPropertyOptional({
    example: 20000,
    description: '1 kg sotish narxi',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  sotish?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Stock (kg)',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  stockKg?: number;
}
