// src/debt/debt.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class DebtService {
  constructor(private readonly db: PrismaService) {}

  async getDebtors() {
    return await this.db.prisma.customer.findMany({
      where: {
        totalDebt: { gt: 0 },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        totalDebt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ totalDebt: 'desc' }, { name: 'asc' }],
    });
  }

  async createCustomer(dto: CreateCustomerDto) {
    const existing = await this.db.prisma.customer.findFirst({
      where: { name: dto.name },
    });

    if (existing) {
      throw new BadRequestException(
        `"${dto.name}" ismli mijoz allaqachon mavjud`,
      );
    }

    return await this.db.prisma.customer.create({
      data: {
        name: dto.name,
        phone: dto.phone || null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        totalDebt: true,
      },
    });
  }

  async payDebt(customerId: string, amount: number) {
    const paymentAmount = new Prisma.Decimal(amount);

    if (paymentAmount.lte(0)) {
      throw new BadRequestException('To‘lov summasi musbat bo‘lishi kerak');
    }

    const customer = await this.db.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`ID ${customerId} bilan mijoz topilmadi`);
    }

    if (paymentAmount.gt(customer.totalDebt)) {
      throw new BadRequestException(
        `To‘lov summasi qarzdan oshib ketdi. Joriy qarz: ${customer.totalDebt} so‘m`,
      );
    }

    const updatedCustomer = await this.db.prisma.customer.update({
      where: { id: customerId },
      data: {
        totalDebt: { decrement: paymentAmount },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        totalDebt: true,
      },
    });

    return {
      success: true,
      message: `${customer.name} ning qarzi muvaffaqiyatli kamaytirildi`,
      previousDebt: customer.totalDebt,
      paidAmount: paymentAmount,
      remainingDebt: updatedCustomer.totalDebt,
      customer: updatedCustomer,
    };
  }
}
