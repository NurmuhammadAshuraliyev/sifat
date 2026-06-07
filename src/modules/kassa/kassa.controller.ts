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
} from '@nestjs/swagger';
import { KassaService } from './kassa.service';
import { CreateKassaHarakatDto } from './dto/create-kassa-harakat.dto';

@ApiTags('Kassa')
@ApiBearerAuth()
@Controller('kassa')
export class KassaController {
  constructor(private readonly kassaService: KassaService) {}

  // ─── GET /kassa ─────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Kassa nazorati maʼlumotlari',
    description:
      "Umumiy qoldiq, jami kirim/chiqim va tarixiy harakatlar ro'yxatini qaytaradi.",
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    example: 'bugun',
    enum: ['bugun', 'hafta', 'oy', 'yil'],
    description: 'Davr filtri',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    example: "go'sht",
    description: "Harakatlar bo'yicha qidiruv",
  })
  @ApiResponse({
    status: 200,
    description: "Kassa nazorati ma'lumotlari muvaffaqiyatli qaytarildi",
    schema: {
      example: {
        umumiyQoldiq: 762392704,
        jamiKirim: 19800,
        jamiChiqim: 0,
        filter: 'bugun',
        tarixiyHarakatlar: [
          {
            id: 'uuid',
            sana: '2026-06-08T10:00:00.000Z',
            izoh: 'BEDRO',
            turi: 'KIRIM',
            miqdor: 19800,
            amal: 'KIRIM',
          },
        ],
      },
    },
  })
  getKassaNazorati(
    @Query('filter') filter: string = 'bugun',
    @Query('search') search?: string,
  ) {
    return this.kassaService.getKassaNazorati(filter, search);
  }

  // ─── GET /kassa/statistika ───────────────────────────────────────────────────
  @Get('statistika')
  @ApiOperation({
    summary: 'Kassa statistikasi',
    description:
      "KIRIM va CHIQIM bo'yicha alohida statistika va sof foyda ma'lumotlarini qaytaradi.",
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    example: 'bugun',
    enum: ['bugun', 'hafta', 'oy', 'yil'],
    description: 'Davr filtri',
  })
  @ApiResponse({
    status: 200,
    description: 'Kassa statistikasi muvaffaqiyatli qaytarildi',
    schema: {
      example: {
        filter: 'bugun',
        kirim: { summa: 19800, tranzaksiyalarSoni: 1 },
        chiqim: { summa: 0, tranzaksiyalarSoni: 0 },
        sofFoyda: 19800,
        jami: 19800,
      },
    },
  })
  getKassaStatistika(@Query('filter') filter: string = 'bugun') {
    return this.kassaService.getKassaStatistika(filter);
  }

  // ─── POST /kassa ─────────────────────────────────────────────────────────────
  @Post()
  @ApiOperation({
    summary: 'Yangi kirim yoki chiqim qoʻshish',
    description:
      "Kassaga yangi KIRIM yoki CHIQIM tranzaksiyasini qo'shadi. Transaction modeliga yoziladi.",
  })
  @ApiResponse({
    status: 201,
    description: "Tranzaksiya muvaffaqiyatli qo'shildi",
    schema: {
      example: {
        success: true,
        message: "Kirim muvaffaqiyatli qo'shildi",
        data: {
          id: 'uuid',
          summa: 500000,
          izoh: 'Kunlik xarajat',
          turi: 'KIRIM',
          sana: '2026-06-08T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Noto'g'ri ma'lumot" })
  createKassaHarakat(@Body() dto: CreateKassaHarakatDto) {
    return this.kassaService.createKassaHarakat(dto);
  }

  // ─── DELETE /kassa/:id ───────────────────────────────────────────────────────
  @Delete(':id')
  @ApiOperation({
    summary: 'Tranzaksiyani oʻchirish',
    description: "Berilgan ID bo'yicha tranzaksiyani o'chiradi.",
  })
  @ApiParam({
    name: 'id',
    description: "Tranzaksiya UUID'si",
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: "Tranzaksiya muvaffaqiyatli o'chirildi",
    schema: {
      example: {
        success: true,
        message: "Tranzaksiya muvaffaqiyatli o'chirildi",
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Tranzaksiya topilmadi' })
  deleteKassaHarakat(@Param('id') id: string) {
    return this.kassaService.deleteKassaHarakat(id);
  }
}
