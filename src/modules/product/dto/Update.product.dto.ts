import { IsOptional, IsString, IsNumber, IsPositive } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  tannarx?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  sotish?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  stockKg?: number;
}
