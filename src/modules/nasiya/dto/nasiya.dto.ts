import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// POST /nasiya — Yangi qarz ochish
export class CreateNasiyaDto {
  @IsUUID()
  customerId!: string; // Mijoz ID (avval Customer yaratilgan bo'lishi kerak)

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  aslSumma!: number; // Qarz summasi

  @IsOptional()
  @IsString()
  izoh?: string;

  @IsOptional()
  @IsUUID()
  saleId?: string; // Qaysi sotuvdan kelib chiqqan
}

// POST /nasiya/mijoz — Yangi mijoz + qarz bir vaqtda
export class CreateMijozVaNasiyaDto {
  @IsString()
  mijozIsmi!: string;

  @IsOptional()
  @IsString()
  telefon?: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  aslSumma!: number;

  @IsOptional()
  @IsString()
  izoh?: string;
}

// PATCH /nasiya/:id — Nasiya izohini yangilash
export class UpdateNasiyaDto {
  @IsOptional()
  @IsString()
  izoh?: string;
}

// POST /nasiya/:id/tolov — Qarzni to'lash
export class QarzTolovDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  summa!: number; // To'lanayotgan summa

  @IsOptional()
  @IsString()
  izoh?: string;
}

// POST /customer — Yangi mijoz yaratish
export class CreateCustomerDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  telefon?: string;
}

// PATCH /customer/:id
export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  telefon?: string;
}
