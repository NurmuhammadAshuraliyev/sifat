import { Controller, Get, Post, Body } from '@nestjs/common';

import { WarehouseService } from './warehouse.service';
import { ReceiveStockDto } from './dto/receive-stock.dto';

// 👉 Swagger
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Warehouse')
@ApiBearerAuth() // 🔐 JWT required (agar ishlatilsa)
@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post('receive')
  @ApiOperation({ summary: 'Receive stock into warehouse' })
  @ApiResponse({
    status: 201,
    description: 'Stock successfully received',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async receive(@Body() receiveStockDto: ReceiveStockDto) {
    return await this.warehouseService.receiveStock(
      receiveStockDto.productId,
      receiveStockDto.quantityKg,
    );
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current warehouse stock' })
  @ApiResponse({
    status: 200,
    description: 'Current stock list',
  })
  async currentStock() {
    return await this.warehouseService.getCurrentStock();
  }
}
