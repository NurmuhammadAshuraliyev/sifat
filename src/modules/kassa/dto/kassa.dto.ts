import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum AmalTuri {
  KIRIM = 'KIRIM',
  CHIQIM = 'CHIQIM',
}

export class CreateKassaHarakatDto {
  @ApiProperty({
    enum: AmalTuri,
    example: AmalTuri.KIRIM,
    description: 'Kassa harakati turi',
  })
  @IsEnum(AmalTuri)
  amalTuri!: AmalTuri;

  @ApiProperty({
    example: 500000,
    description: 'Harakat summasi',
  })
  @IsNumber()
  @Type(() => Number)
  summa!: number;

  @ApiProperty({
    example: 'Kunlik xarajat',
    description: 'Harakat izohi',
  })
  @IsString()
  izoh!: string;

  @ApiPropertyOptional({
    example: 'NAQD',
    description: "To'lov turi (NAQD yoki KARTA)",
  })
  @IsOptional()
  @IsString()
  toMashTuri?: string;
}
