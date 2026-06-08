// import { Controller, Get, Query } from '@nestjs/common';
// import {
//   ApiBearerAuth,
//   ApiOperation,
//   ApiQuery,
//   ApiResponse,
//   ApiTags,
// } from '@nestjs/swagger';
// import { KassaService } from './kassa.service';

// @ApiTags('Kassa')
// @ApiBearerAuth()
// @Controller('kassa')
// export class KassaController {
//   constructor(private readonly kassaService: KassaService) {}

//   /**
//    * GET /kassa
//    * GET /kassa?filter=bugun|hafta|oy|yil
//    * GET /kassa?filter=bugun&search=go'sht
//    * Rasm 3 - Kassa Nazorati asosiy sahifasi:
//    *   - Umumiy qoldiq
//    *   - Jami kirim / jami chiqim
//    *   - Tarixiy harakatlar ro'yxati
//    */
//   @Get()
//   @ApiOperation({
//     summary: 'Kassa nazorati maʼlumotlari',
//     description:
//       "Umumiy qoldiq, jami kirim/chiqim va tarixiy harakatlar ro'yxatini qaytaradi.",
//   })
//   @ApiQuery({
//     name: 'filter',
//     required: false,
//     example: 'bugun',
//     enum: ['bugun', 'hafta', 'oy', 'yil'],
//     description: 'Davr filtri',
//   })
//   @ApiQuery({
//     name: 'search',
//     required: false,
//     example: "go'sht",
//     description: "Harakatlar bo'yicha qidiruv",
//   })
//   @ApiResponse({
//     status: 200,
//     description: "Kassa nazorati ma'lumotlari muvaffaqiyatli qaytarildi",
//   })
//   getKassaNazorati(
//     @Query('filter') filter: string = 'bugun',
//     @Query('search') search?: string,
//   ) {
//     return this.kassaService.getKassaNazorati(filter, search);
//   }

//   /**
//    * GET /kassa/statistika
//    * GET /kassa/statistika?filter=bugun|hafta|oy|yil
//    * NAQD, KARTA, NASIYA alohida statistika
//    */
//   @Get('statistika')
//   @ApiOperation({
//     summary: 'Kassa statistikasi',
//     description:
//       "NAQD, KARTA va NASIYA bo'yicha alohida statistika ma'lumotlarini qaytaradi.",
//   })
//   @ApiQuery({
//     name: 'filter',
//     required: false,
//     example: 'bugun',
//     enum: ['bugun', 'hafta', 'oy', 'yil'],
//     description: 'Davr filtri',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Kassa statistikasi muvaffaqiyatli qaytarildi',
//   })
//   getKassaStatistika(@Query('filter') filter: string = 'bugun') {
//     return this.kassaService.getKassaStatistika(filter);
//   }
// }

//////
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { KassaService, CreateKassaHarakatDto } from './kassa.service';

@ApiTags('Kassa')
@ApiBearerAuth()
@Controller('kassa')
export class KassaController {
  constructor(private readonly kassaService: KassaService) {}

  @Get()
  @ApiOperation({ summary: 'Kassa nazorati — qoldiq, kirim, chiqim, tarix' })
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: ['bugun', 'hafta', 'oy', 'yil'],
  })
  @ApiQuery({ name: 'search', required: false })
  getKassaNazorati(
    @Query('filter') filter: string = 'bugun',
    @Query('search') search?: string,
  ) {
    return this.kassaService.getKassaNazorati(filter, search);
  }

  @Get('statistika')
  @ApiOperation({ summary: 'Kassa statistikasi — KIRIM/CHIQIM alohida' })
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: ['bugun', 'hafta', 'oy', 'yil'],
  })
  getKassaStatistika(@Query('filter') filter: string = 'bugun') {
    return this.kassaService.getKassaStatistika(filter);
  }

  @Post()
  @ApiOperation({ summary: 'Yangi kirim yoki chiqim qoʻshish' })
  @ApiBody({
    schema: {
      example: {
        type: 'income', // "income" | "expense" (frontend)
        amalTuri: 'KIRIM', // "KIRIM" | "CHIQIM" (backend)  — biri yetarli
        summa: 500000,
        amount: 500000, // — biri yetarli
        izoh: 'Kunlik daromad',
        description: 'Kunlik daromad', // — biri yetarli
      },
    },
  })
  @ApiResponse({ status: 201, description: "Tranzaksiya qo'shildi" })
  createKassaHarakat(@Body() dto: CreateKassaHarakatDto) {
    return this.kassaService.createKassaHarakat(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Tranzaksiyani oʻchirish' })
  @ApiParam({ name: 'id', description: 'Tranzaksiya UUID' })
  @ApiResponse({ status: 200, description: "O'chirildi" })
  @ApiResponse({ status: 404, description: 'Topilmadi' })
  deleteKassaHarakat(@Param('id') id: string) {
    return this.kassaService.deleteKassaHarakat(id);
  }
}
