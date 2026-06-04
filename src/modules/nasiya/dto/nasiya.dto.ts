import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNasiyaDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Mijoz ID',
  })
  @IsUUID()
  customerId!: string;

  @ApiProperty({
    example: 500000,
    description: 'Qarz summasi',
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  aslSumma!: number;

  @ApiPropertyOptional({
    example: '1 oy muddatga berildi',
  })
  @IsOptional()
  @IsString()
  izoh?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Bog‘langan sotuv ID',
  })
  @IsOptional()
  @IsUUID()
  saleId?: string;
}

export class CreateMijozVaNasiyaDto {
  @ApiProperty({
    example: 'Ali Valiyev',
  })
  @IsString()
  mijozIsmi!: string;

  @ApiPropertyOptional({
    example: '+998901234567',
  })
  @IsOptional()
  @IsString()
  telefon?: string;

  @ApiProperty({
    example: 350000,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  aslSumma!: number;

  @ApiPropertyOptional({
    example: 'Doimiy mijoz',
  })
  @IsOptional()
  @IsString()
  izoh?: string;
}

export class UpdateNasiyaDto {
  @ApiPropertyOptional({
    example: 'Muddat uzaytirildi',
  })
  @IsOptional()
  @IsString()
  izoh?: string;
}

export class QarzTolovDto {
  @ApiProperty({
    example: 100000,
    description: "To'lanayotgan summa",
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  summa!: number;

  @ApiPropertyOptional({
    example: "Birinchi to'lov",
  })
  @IsOptional()
  @IsString()
  izoh?: string;
}

export class CreateCustomerDto {
  @ApiProperty({
    example: 'Ali Valiyev',
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: '+998901234567',
  })
  @IsOptional()
  @IsString()
  telefon?: string;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional({
    example: 'Ali Valiyev',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: '+998901234567',
  })
  @IsOptional()
  @IsString()
  telefon?: string;
}
