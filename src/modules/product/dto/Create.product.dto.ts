import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  tannarx: number; // 1 kg uchun tannarx (cost price)

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  sotish: number; // 1 kg uchun sotish narxi (selling price)
}
