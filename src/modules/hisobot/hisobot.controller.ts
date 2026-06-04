import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HisobotService } from './hisobot.service';

@ApiTags('Hisobot')
@ApiBearerAuth()
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
  @ApiOperation({
    summary: 'Hisobotlar sahifasi maʼlumotlarini olish',
    description:
      "Umumiy savdo, sof foyda, undirilgan qarzlar, savdo tarixi va undirilgan qarzlar ro'yxatini qaytaradi.",
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    example: 'kun',
    enum: ['kun', 'hafta', 'oy', 'yil'],
    description: 'Hisobot davri filtri',
  })
  @ApiResponse({
    status: 200,
    description: "Hisobot ma'lumotlari muvaffaqiyatli qaytarildi",
  })
  getHisobot(@Query('filter') filter: string = 'kun') {
    return this.hisobotService.getHisobot(filter);
  }

  /**
   * GET /hisobot/top-mahsulotlar
   * GET /hisobot/top-mahsulotlar?filter=kun|hafta|oy|yil
   * Eng ko'p sotilgan 10 ta mahsulot
   */
  @Get('top-mahsulotlar')
  @ApiOperation({
    summary: "Eng ko'p sotilgan 10 ta mahsulot",
    description:
      "Tanlangan davr bo'yicha eng ko'p sotilgan 10 ta mahsulot ro'yxatini qaytaradi.",
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    example: 'kun',
    enum: ['kun', 'hafta', 'oy', 'yil'],
    description: 'Hisobot davri filtri',
  })
  @ApiResponse({
    status: 200,
    description:
      "Eng ko'p sotilgan mahsulotlar ro'yxati muvaffaqiyatli qaytarildi",
  })
  getTopMahsulotlar(@Query('filter') filter: string = 'kun') {
    return this.hisobotService.getTopMahsulotlar(filter);
  }
}
