import { Controller, Get, Query } from '@nestjs/common';
import { KassaService } from './kassa.service';

@Controller('kassa')
export class KassaController {
  constructor(private readonly kassaService: KassaService) {}

  /**
   * GET /kassa
   * GET /kassa?filter=bugun|hafta|oy|yil
   * GET /kassa?filter=bugun&search=go'sht
   * Rasm 3 - Kassa Nazorati asosiy sahifasi:
   *   - Umumiy qoldiq
   *   - Jami kirim / jami chiqim
   *   - Tarixiy harakatlar ro'yxati
   */
  @Get()
  getKassaNazorati(
    @Query('filter') filter: string = 'bugun',
    @Query('search') search?: string,
  ) {
    return this.kassaService.getKassaNazorati(filter, search);
  }

  /**
   * GET /kassa/statistika
   * GET /kassa/statistika?filter=bugun|hafta|oy|yil
   * NAQD, KARTA, NASIYA alohida statistika
   */
  @Get('statistika')
  getKassaStatistika(@Query('filter') filter: string = 'bugun') {
    return this.kassaService.getKassaStatistika(filter);
  }
}
