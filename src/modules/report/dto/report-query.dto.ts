import { IsOptional, IsEnum, IsString } from 'class-validator';

export enum ReportPeriod {
  BUGUN = 'bugun',
  KECHA = 'kecha',
  _7KUN = '7kun',
  _14KUN = '14kun',
  OY = 'oy',
  YIL = 'yil',
}

export class ReportQueryDto {
  @IsOptional()
  @IsEnum(ReportPeriod, { message: 'Noto‘g‘ri period tanlandi' })
  period?: ReportPeriod = ReportPeriod.BUGUN;
}
