import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum AmalTuri {
  KIRIM = 'KIRIM',
  CHIQIM = 'CHIQIM',
}

export class CreateKassaHarakatDto {
  @IsEnum(AmalTuri)
  amalTuri: AmalTuri;

  @IsNumber()
  @Type(() => Number)
  summa: number;

  @IsString()
  izoh: string;

  @IsOptional()
  @IsString()
  toMashTuri?: string; // 'NAQD' | 'KARTA'
}
