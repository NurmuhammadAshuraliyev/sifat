import { Controller, Get, Query } from '@nestjs/common';
import { HisobotService } from './hisobot.service';

@Controller('hisobot')
export class HisobotController {
  constructor(private readonly hisobotService: HisobotService) {}

  /**
   * GET /hisobot
   * GET /hisobot?filter=kun|hafta|oy|yil
   *
   * Rasm 4 - HISOBOTLAR sahifasi uchun barcha ma'lumotlar:
   *   - Umumiy savdo (naqd + karta qismlari bilan)
   *   - Sof foyda (tannarxdan tashqari)
   *   - Undirilgan qarzlar (kassaga kirgan qarz pullari)
   *   - Savdo tarixi ro'yxati
   *   - Undirilgan qarzlar ro'yxati
   */
  @Get()
  getHisobot(@Query('filter') filter: string = 'kun') {
    return this.hisobotService.getHisobot(filter);
  }

  /**
   * GET /hisobot/top-mahsulotlar
   * GET /hisobot/top-mahsulotlar?filter=kun|hafta|oy|yil
   * Eng ko'p sotilgan 10 ta mahsulot
   */
  @Get('top-mahsulotlar')
  getTopMahsulotlar(@Query('filter') filter: string = 'kun') {
    return this.hisobotService.getTopMahsulotlar(filter);
  }
}
