import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNasiyaDto {
  @IsString()
  mijozIsmi: string;

  @IsOptional()
  @IsString()
  telefon?: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  qarzSumma: number;

  @IsOptional()
  @IsString()
  izoh?: string;
}

export class UpdateNasiyaDto {
  @IsOptional()
  @IsString()
  mijozIsmi?: string;

  @IsOptional()
  @IsString()
  telefon?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalDebt?: number;
}

export class QarzToMashDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  toMashSumma: number;

  @IsOptional()
  @IsString()
  izoh?: string;
}
