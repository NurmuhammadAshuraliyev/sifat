// src/receipt/receipt.controller.ts
import {
  Controller,
  Get,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { ReceiptQueryDto } from './dto/receipt-query.dto';

@Controller('receipt')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Get(':saleId')
  async getReceipt(@Param() params: ReceiptQueryDto) {
    return await this.receiptService.generateReceipt(params.saleId);
  }
}
