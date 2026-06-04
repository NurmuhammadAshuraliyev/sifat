import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/statistika
   * Rasm 1 - Barcha statistika ma'lumotlari
   */
  @Get('statistika')
  getStatistika() {
    return this.dashboardService.getStatistika();
  }

  @Get('statistika/period')
  getPeriodStatistika(@Query('filter') filter: string = 'bugun') {
    return this.dashboardService.getPeriodStatistika(filter);
  }
}
