import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/statistika
   * Rasm 1 - Barcha statistika ma'lumotlari
   */
  @Get('statistika')
  @ApiOperation({
    summary: "Barcha statistika ma'lumotlarini olish",
  })
  @ApiResponse({
    status: 200,
    description: "Statistika ma'lumotlari muvaffaqiyatli qaytarildi",
  })
  getStatistika() {
    return this.dashboardService.getStatistika();
  }

  @Get('statistika/period')
  @ApiOperation({
    summary: "Davr bo'yicha statistika olish",
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    example: 'bugun',
    enum: ['bugun', 'hafta', 'oy', 'yil'],
    description: 'Statistika filtri',
  })
  @ApiResponse({
    status: 200,
    description: "Davr bo'yicha statistika muvaffaqiyatli qaytarildi",
  })
  getPeriodStatistika(@Query('filter') filter: string = 'bugun') {
    return this.dashboardService.getPeriodStatistika(filter);
  }
}
