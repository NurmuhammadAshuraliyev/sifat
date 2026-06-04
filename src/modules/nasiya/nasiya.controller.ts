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
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { NasiyaService } from './nasiya.service';
import {
  CreateNasiyaDto,
  CreateMijozVaNasiyaDto,
  UpdateNasiyaDto,
  QarzTolovDto,
  CreateCustomerDto,
  UpdateCustomerDto,
} from './dto/nasiya.dto';

@ApiTags('Nasiya')
@Controller('nasiya')
export class NasiyaController {
  constructor(private readonly nasiyaService: NasiyaService) {}

  // =========================
  // CUSTOMER ENDPOINTLARI
  // =========================

  @Get('customers')
  @ApiOperation({
    summary: 'Barcha mijozlar ro‘yxati',
    description: 'Mijozlar va ularning jami qarzlarini qaytaradi',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    example: 'Ali',
    description: 'Ism yoki telefon bo‘yicha qidiruv',
  })
  @ApiResponse({
    status: 200,
    description: "Mijozlar ro'yxati muvaffaqiyatli qaytarildi",
  })
  getAllCustomers(@Query('search') search?: string) {
    return this.nasiyaService.getAllCustomers(search);
  }

  @Post('customers')
  @ApiOperation({
    summary: 'Yangi mijoz yaratish',
  })
  @ApiBody({
    type: CreateCustomerDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Mijoz muvaffaqiyatli yaratildi',
  })
  createCustomer(@Body() dto: CreateCustomerDto) {
    return this.nasiyaService.createCustomer(dto);
  }

  @Patch('customers/:id')
  @ApiOperation({
    summary: "Mijoz ma'lumotlarini yangilash",
  })
  @ApiParam({
    name: 'id',
    description: 'Mijoz ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateCustomerDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Mijoz muvaffaqiyatli yangilandi',
  })
  updateCustomer(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.nasiyaService.updateCustomer(id, dto);
  }

  @Delete('customers/:id')
  @ApiOperation({
    summary: "Mijozni o'chirish",
  })
  @ApiParam({
    name: 'id',
    description: 'Mijoz ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: "Mijoz muvaffaqiyatli o'chirildi",
  })
  deleteCustomer(@Param('id') id: string) {
    return this.nasiyaService.deleteCustomer(id);
  }

  // =========================
  // NASIYA ENDPOINTLARI
  // =========================

  @Get()
  @ApiOperation({
    summary: 'Barcha nasiyalar ro‘yxati',
    description:
      'Default holatda active nasiyalar qaytadi. Search va status bo‘yicha filterlash mumkin.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    example: 'Ali',
    description: 'Mijoz ismi yoki telefon raqami',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'closed', 'all'],
    example: 'active',
  })
  @ApiResponse({
    status: 200,
    description: "Nasiyalar ro'yxati muvaffaqiyatli qaytarildi",
  })
  getAllNasiyalar(
    @Query('search') search?: string,
    @Query('status') status?: 'active' | 'closed' | 'all',
  ) {
    return this.nasiyaService.getAllNasiyalar(search, status);
  }

  @Get('customer/:customerId')
  @ApiOperation({
    summary: 'Mijozning barcha nasiyalarini olish',
  })
  @ApiParam({
    name: 'customerId',
    description: 'Mijoz ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Mijozning nasiyalari qaytarildi',
  })
  getNasiyalarByCustomer(@Param('customerId') customerId: string) {
    return this.nasiyaService.getNasiyalarByCustomer(customerId);
  }

  @Get(':id')
  @ApiOperation({
    summary: "Bitta nasiya ma'lumotlari",
    description: "Nasiya va uning to'lov tarixini qaytaradi",
  })
  @ApiParam({
    name: 'id',
    description: 'Nasiya ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: "Nasiya ma'lumotlari qaytarildi",
  })
  getNasiyaById(@Param('id') id: string) {
    return this.nasiyaService.getNasiyaById(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Mavjud mijozga yangi qarz ochish',
  })
  @ApiBody({
    type: CreateNasiyaDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Nasiya muvaffaqiyatli yaratildi',
  })
  createNasiya(@Body() dto: CreateNasiyaDto) {
    return this.nasiyaService.createNasiya(dto);
  }

  @Post('mijoz')
  @ApiOperation({
    summary: 'Yangi mijoz va nasiya yaratish',
  })
  @ApiBody({
    type: CreateMijozVaNasiyaDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Mijoz va nasiya muvaffaqiyatli yaratildi',
  })
  createMijozVaNasiya(@Body() dto: CreateMijozVaNasiyaDto) {
    return this.nasiyaService.createMijozVaNasiya(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Nasiya izohini yangilash',
  })
  @ApiParam({
    name: 'id',
    description: 'Nasiya ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiBody({
    type: UpdateNasiyaDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Nasiya muvaffaqiyatli yangilandi',
  })
  updateNasiya(@Param('id') id: string, @Body() dto: UpdateNasiyaDto) {
    return this.nasiyaService.updateNasiya(id, dto);
  }

  @Post(':id/tolov')
  @ApiOperation({
    summary: "Qarz to'lash",
    description: "Qisman yoki to'liq qarz to'lovi",
  })
  @ApiParam({
    name: 'id',
    description: 'Nasiya ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiBody({
    type: QarzTolovDto,
  })
  @ApiResponse({
    status: 201,
    description: "To'lov muvaffaqiyatli amalga oshirildi",
  })
  qarzTolov(@Param('id') id: string, @Body() dto: QarzTolovDto) {
    return this.nasiyaService.qarzTolov(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: "Nasiyani o'chirish",
  })
  @ApiParam({
    name: 'id',
    description: 'Nasiya ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: "Nasiya muvaffaqiyatli o'chirildi",
  })
  deleteNasiya(@Param('id') id: string) {
    return this.nasiyaService.deleteNasiya(id);
  }
}
