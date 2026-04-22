import { Controller, Get, Param } from '@nestjs/common';

import { ReceiptService } from './receipt.service';
import { ReceiptQueryDto } from './dto/receipt-query.dto';

// 👉 Swagger
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Receipt')
@ApiBearerAuth() // 🔐 agar auth bo‘lsa
@Controller('receipt')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Get(':saleId')
  @ApiOperation({ summary: 'Get receipt by sale ID' })
  @ApiParam({
    name: 'saleId',
    description: 'Sale ID (UUID v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Receipt generated successfully',
  })
  async getReceipt(@Param() params: ReceiptQueryDto) {
    return await this.receiptService.generateReceipt(params.saleId);
  }
}
