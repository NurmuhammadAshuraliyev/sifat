import { Controller, Post, Body } from '@nestjs/common';

import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';

// 👉 Swagger
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Sale')
@ApiBearerAuth() // 🔐 agar JWT ishlatilsa
@Controller('sale')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  @ApiOperation({ summary: 'Create new sale (checkout)' })
  @ApiResponse({
    status: 201,
    description: 'Sale successfully created',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async createSale(@Body() dto: CreateSaleDto) {
    return this.saleService.create(dto);
  }
}
