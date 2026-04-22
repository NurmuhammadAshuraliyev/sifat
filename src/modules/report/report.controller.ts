import { Controller, Get, Query } from '@nestjs/common';

import { ReportService } from './report.service';
import { ReportQueryDto } from './dto/report-query.dto';

// 👉 Swagger
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Report')
@ApiBearerAuth() // 🔐 agar JWT ishlatilsa
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  @ApiOperation({ summary: 'Generate report by period' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['bugun', 'kecha', '7kun', '14kun', 'oy', 'yil'],
    description: 'Report period filter',
    example: 'bugun',
  })
  @ApiResponse({
    status: 200,
    description: 'Report generated successfully',
  })
  async getReport(@Query() query: ReportQueryDto) {
    return await this.reportService.generateReport(query.period!);
  }
}
