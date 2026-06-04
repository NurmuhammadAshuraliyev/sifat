import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { NasiyaService } from './nasiya.service';
import {
  CreateNasiyaDto,
  UpdateNasiyaDto,
  QarzToMashDto,
} from './dto/nasiya.dto';

@Controller('nasiya')
export class NasiyaController {
  constructor(private readonly nasiyaService: NasiyaService) {}

  /**
   * GET /nasiya
   * GET /nasiya?search=ism_yoki_telefon
   * Rasm 2 - Barcha nasiya mijozlar ro'yxati + jami qarz
   */
  @Get()
  getAllNasiyalar(@Query('search') search?: string) {
    return this.nasiyaService.getAllNasiyalar(search);
  }

  /**
   * GET /nasiya/:id
   * Bitta mijozning barcha qarz tarixi
   */
  @Get(':id')
  getNasiyaById(@Param('id') id: string) {
    return this.nasiyaService.getNasiyaById(id);
  }

  /**
   * POST /nasiya
   * Yangi qarz qo'shish (YANGI QARZ tugmasi - rasm 2)
   * Body: { mijozIsmi, telefon?, qarzSumma }
   */
  @Post()
  createNasiya(@Body() dto: CreateNasiyaDto) {
    return this.nasiyaService.createNasiya(dto);
  }

  /**
   * PATCH /nasiya/:id
   * Mijoz ma'lumotlarini yangilash
   * Body: { mijozIsmi?, telefon?, totalDebt? }
   */
  @Patch(':id')
  updateNasiya(@Param('id') id: string, @Body() dto: UpdateNasiyaDto) {
    return this.nasiyaService.updateNasiya(id, dto);
  }

  /**
   * PATCH /nasiya/:id/tomash
   * Qarzni to'lash (qisman yoki to'liq)
   * Body: { toMashSumma, izoh? }
   */
  @Patch(':id/tomash')
  qarzToMash(@Param('id') id: string, @Body() dto: QarzToMashDto) {
    return this.nasiyaService.qarzToMash(id, dto);
  }

  /**
   * DELETE /nasiya/:id
   * Nasiya mijozni o'chirish (faqat qarz = 0 bo'lsa)
   */
  @Delete(':id')
  deleteNasiya(@Param('id') id: string) {
    return this.nasiyaService.deleteNasiya(id);
  }
}
