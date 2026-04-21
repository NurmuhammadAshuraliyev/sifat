// src/debt/debt.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  Put,
} from '@nestjs/common';
import { DebtService } from './debt.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { PayDebtDto } from './dto/pay-debt.dto';

@Controller('debt')
export class DebtController {
  constructor(private readonly debtService: DebtService) {}

  @Get()
  async getAllDebts() {
    return this.debtService.getDebtors();
  }

  @Post('customer')
  async createCustomer(@Body() dto: CreateCustomerDto) {
    return this.debtService.createCustomer(dto);
  }

  @Put('pay/:customerId')
  async payDebt(
    @Param('customerId') customerId: string,
    @Body() dto: PayDebtDto,
  ) {
    return this.debtService.payDebt(customerId, dto.amount);
  }
}
