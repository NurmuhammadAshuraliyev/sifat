import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsPhoneNumber,
  IsUUID,
} from 'class-validator';

export class CreateCustomerDto {
  @IsNotEmpty({ message: 'Mijoz ismi kiritilishi shart' })
  @IsString()
  name: string;

  @IsOptional()
  @IsPhoneNumber('UZ', { message: 'Noto‘g‘ri telefon raqami formati' })
  phone?: string;
}
