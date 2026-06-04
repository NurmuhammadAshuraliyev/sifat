// import {
//   Controller,
//   Get,
//   Post,
//   Patch,
//   Delete,
//   Body,
//   Param,
//   Query,
// } from '@nestjs/common';
// import { NasiyaService } from './nasiya.service';
// import {
//   CreateNasiyaDto,
//   UpdateNasiyaDto,
//   QarzToMashDto,
// } from './dto/nasiya.dto';

// @Controller('nasiya')
// export class NasiyaController {
//   constructor(private readonly nasiyaService: NasiyaService) {}

//   /**
//    * GET /nasiya
//    * GET /nasiya?search=ism_yoki_telefon
//    * Rasm 2 - Barcha nasiya mijozlar ro'yxati + jami qarz
//    */
//   @Get()
//   getAllNasiyalar(@Query('search') search?: string) {
//     return this.nasiyaService.getAllNasiyalar(search);
//   }

//   /**
//    * GET /nasiya/:id
//    * Bitta mijozning barcha qarz tarixi
//    */
//   @Get(':id')
//   getNasiyaById(@Param('id') id: string) {
//     return this.nasiyaService.getNasiyaById(id);
//   }

//   /**
//    * POST /nasiya
//    * Yangi qarz qo'shish (YANGI QARZ tugmasi - rasm 2)
//    * Body: { mijozIsmi, telefon?, qarzSumma }
//    */
//   @Post()
//   createNasiya(@Body() dto: CreateNasiyaDto) {
//     return this.nasiyaService.createNasiya(dto);
//   }

//   /**
//    * PATCH /nasiya/:id
//    * Mijoz ma'lumotlarini yangilash
//    * Body: { mijozIsmi?, telefon?, totalDebt? }
//    */
//   @Patch(':id')
//   updateNasiya(@Param('id') id: string, @Body() dto: UpdateNasiyaDto) {
//     return this.nasiyaService.updateNasiya(id, dto);
//   }

//   /**
//    * PATCH /nasiya/:id/tomash
//    * Qarzni to'lash (qisman yoki to'liq)
//    * Body: { toMashSumma, izoh? }
//    */
//   @Patch(':id/tomash')
//   qarzToMash(@Param('id') id: string, @Body() dto: QarzToMashDto) {
//     return this.nasiyaService.qarzToMash(id, dto);
//   }

//   /**
//    * DELETE /nasiya/:id
//    * Nasiya mijozni o'chirish (faqat qarz = 0 bo'lsa)
//    */
//   @Delete(':id')
//   deleteNasiya(@Param('id') id: string) {
//     return this.nasiyaService.deleteNasiya(id);
//   }
// }

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
  CreateMijozVaNasiyaDto,
  UpdateNasiyaDto,
  QarzTolovDto,
  CreateCustomerDto,
  UpdateCustomerDto,
} from './dto/nasiya.dto';

@Controller('nasiya')
export class NasiyaController {
  constructor(private readonly nasiyaService: NasiyaService) {}

  // ─────────────────────────────────
  // CUSTOMER (MIJOZ) ENDPOINTLARI
  // ─────────────────────────────────

  /**
   * GET /nasiya/customers
   * GET /nasiya/customers?search=Ali
   * Barcha mijozlar + ularning jami qarzlari
   */
  @Get('customers')
  getAllCustomers(@Query('search') search?: string) {
    return this.nasiyaService.getAllCustomers(search);
  }

  /**
   * POST /nasiya/customers
   * Yangi mijoz yaratish (qarsiz)
   * Body: { name, telefon? }
   */
  @Post('customers')
  createCustomer(@Body() dto: CreateCustomerDto) {
    return this.nasiyaService.createCustomer(dto);
  }

  /**
   * PATCH /nasiya/customers/:id
   * Mijoz ism/telefonini yangilash
   */
  @Patch('customers/:id')
  updateCustomer(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.nasiyaService.updateCustomer(id, dto);
  }

  /**
   * DELETE /nasiya/customers/:id
   * Mijozni o'chirish (faqat qarz = 0 bo'lsa)
   */
  @Delete('customers/:id')
  deleteCustomer(@Param('id') id: string) {
    return this.nasiyaService.deleteCustomer(id);
  }

  // ─────────────────────────────────
  // NASIYA ENDPOINTLARI
  // ─────────────────────────────────

  /**
   * GET /nasiya
   * GET /nasiya?search=Ali
   * GET /nasiya?status=active|closed|all
   * Barcha nasiyalar ro'yxati (default: faqat faollar)
   */
  @Get()
  getAllNasiyalar(
    @Query('search') search?: string,
    @Query('status') status?: 'active' | 'closed' | 'all',
  ) {
    return this.nasiyaService.getAllNasiyalar(search, status);
  }

  /**
   * GET /nasiya/customer/:customerId
   * Bitta mijozning barcha nasiyalari
   */
  @Get('customer/:customerId')
  getNasiyalarByCustomer(@Param('customerId') customerId: string) {
    return this.nasiyaService.getNasiyalarByCustomer(customerId);
  }

  /**
   * GET /nasiya/:id
   * Bitta nasiya — to'liq ma'lumot + to'lov tarixi
   */
  @Get(':id')
  getNasiyaById(@Param('id') id: string) {
    return this.nasiyaService.getNasiyaById(id);
  }

  /**
   * POST /nasiya
   * Mavjud mijozga yangi qarz ochish
   * Body: { customerId, aslSumma, izoh?, saleId? }
   */
  @Post()
  createNasiya(@Body() dto: CreateNasiyaDto) {
    return this.nasiyaService.createNasiya(dto);
  }

  /**
   * POST /nasiya/mijoz
   * Yangi mijoz + qarz bir vaqtda (YANGI QARZ tugmasi uchun)
   * Body: { mijozIsmi, telefon?, aslSumma, izoh? }
   */
  @Post('mijoz')
  createMijozVaNasiya(@Body() dto: CreateMijozVaNasiyaDto) {
    return this.nasiyaService.createMijozVaNasiya(dto);
  }

  /**
   * PATCH /nasiya/:id
   * Nasiya izohini yangilash
   */
  @Patch(':id')
  updateNasiya(@Param('id') id: string, @Body() dto: UpdateNasiyaDto) {
    return this.nasiyaService.updateNasiya(id, dto);
  }

  /**
   * POST /nasiya/:id/tolov
   * Qarzni to'lash — to'lov tarixi saqlanadi
   * Body: { summa, izoh? }
   */
  @Post(':id/tolov')
  qarzTolov(@Param('id') id: string, @Body() dto: QarzTolovDto) {
    return this.nasiyaService.qarzTolov(id, dto);
  }

  /**
   * DELETE /nasiya/:id
   * Nasiyani o'chirish (faqat CLOSED yoki qolganQarz = 0)
   */
  @Delete(':id')
  deleteNasiya(@Param('id') id: string) {
    return this.nasiyaService.deleteNasiya(id);
  }
}
