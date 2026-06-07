import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsPositive,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum AmalTuri {
  KIRIM = 'KIRIM',
  CHIQIM = 'CHIQIM',
}

export class CreateKassaHarakatDto {
  @ApiProperty({
    enum: AmalTuri,
    example: AmalTuri.KIRIM,
    description: 'Kassa harakati turi: KIRIM yoki CHIQIM',
  })
  @IsEnum(AmalTuri)
  amalTuri!: AmalTuri;

  @ApiProperty({
    example: 500000,
    description: "Harakat summasi (musbat son bo'lishi shart)",
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  summa!: number;

  @ApiProperty({
    example: 'Kunlik xarajat',
    description: 'Harakat izohi (kamida 2 belgi)',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  izoh!: string;

  @ApiPropertyOptional({
    example: 'NAQD',
    description: "To'lov turi (ixtiyoriy, ma'lumot uchun)",
  })
  @IsOptional()
  @IsString()
  tolovTuri?: string;
}
