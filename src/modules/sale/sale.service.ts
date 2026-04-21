// src/sale/sale.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SaleService {
  constructor(private readonly db: PrismaService) {}

  async create(dto: CreateSaleDto) {
    return await this.db.prisma.$transaction(async (tx) => {
      let total = new Prisma.Decimal(0);
      const saleItems: any[] = [];

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Mahsulot topilmadi: ${item.productId}`);
        }

        const quantity = new Prisma.Decimal(item.quantityKg);
        const price = new Prisma.Decimal(product.sotish);

        if (quantity.gt(product.stockKg)) {
          throw new BadRequestException(
            `${product.name} yetarli emas! Omborda: ${product.stockKg} kg`,
          );
        }

        const subtotal = quantity.mul(price);
        total = total.add(subtotal);

        saleItems.push({
          quantityKg: quantity,
          pricePerKg: price,
          costPerKg: new Prisma.Decimal(product.tannarx),
          product: {
            connect: { id: item.productId },
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { stockKg: { decrement: quantity } },
        });
      }

      // Savdo yaratish
      const sale = await tx.sale.create({
        data: {
          totalAmount: total,
          paymentMethod: dto.paymentMethod,
          customerId: dto.paymentMethod === 'NASIYA' ? dto.customerId : null,
          items: {
            create: saleItems, // endi to'g'ri
          },
        },
        include: {
          items: {
            include: { product: true },
          },
          customer: true,
        },
      });

      if (dto.paymentMethod === 'NASIYA' && dto.customerId) {
        await tx.customer.update({
          where: { id: dto.customerId },
          data: { totalDebt: { increment: total } },
        });
      }

      return {
        success: true,
        message: 'Sotuv muvaffaqiyatli amalga oshirildi',
        sale,
        total: Number(total),
      };
    });
  }
}
