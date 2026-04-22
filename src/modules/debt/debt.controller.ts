import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';

import { DebtService } from './debt.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { PayDebtDto } from './dto/pay-debt.dto';

// 👉 Swagger
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

// 👉 agar JWT guard bo‘lsa

@ApiTags('Debt')
@ApiBearerAuth() // 🔐 Swagger’da Authorize tugma chiqadi
@Controller('debt')
export class DebtController {
  constructor(private readonly debtService: DebtService) {}

  @Get()
  @ApiOperation({ summary: 'Get all debtors' })
  @ApiResponse({ status: 200, description: 'List of debtors' })
  async getAllDebts() {
    return this.debtService.getDebtors();
  }

  @Post('customer')
  @ApiOperation({ summary: 'Create customer' })
  @ApiResponse({ status: 201, description: 'Customer created' })
  async createCustomer(@Body() dto: CreateCustomerDto) {
    return this.debtService.createCustomer(dto);
  }

  @Put('pay/:customerId')
  @ApiOperation({ summary: 'Pay debt for customer' })
  @ApiResponse({ status: 200, description: 'Debt paid successfully' })
  async payDebt(
    @Param('customerId') customerId: string,
    @Body() dto: PayDebtDto,
  ) {
    return this.debtService.payDebt(customerId, dto.amount);
  }
}
