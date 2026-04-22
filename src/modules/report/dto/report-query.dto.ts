import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportPeriod {
  BUGUN = 'bugun',
  KECHA = 'kecha',
  _7KUN = '7kun',
  _14KUN = '14kun',
  OY = 'oy',
  YIL = 'yil',
}

export class ReportQueryDto {
  @ApiPropertyOptional({
    enum: ReportPeriod,
    default: ReportPeriod.BUGUN,
    description: 'Hisobot davri',
  })
  @IsOptional()
  @IsEnum(ReportPeriod, { message: 'Noto‘g‘ri period tanlandi' })
  period?: ReportPeriod = ReportPeriod.BUGUN;
}
