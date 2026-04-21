// src/warehouse/warehouse.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { ReceiveStockDto } from './dto/receive-stock.dto';

@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post('receive')
  async receive(@Body() receiveStockDto: ReceiveStockDto) {
    return await this.warehouseService.receiveStock(
      receiveStockDto.productId,
      receiveStockDto.quantityKg,
    );
  }

  @Get('current')
  async currentStock() {
    return await this.warehouseService.getCurrentStock();
  }
}
