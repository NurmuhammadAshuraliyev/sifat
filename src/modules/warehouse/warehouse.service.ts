// src/warehouse/warehouse.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { ReceiveStockDto } from './dto/receive-stock.dto';

@Injectable()
export class WarehouseService {
  constructor(private readonly db: PrismaService) {}

  async receiveStock(productId: string, quantityKg: number) {
    const updatedProduct = await this.db.prisma.product
      .update({
        where: { id: productId },
        data: {
          stockKg: {
            increment: quantityKg,
          },
        },
        select: {
          id: true,
          name: true,
          stockKg: true,
          tannarx: true,
          sotish: true,
        },
      })
      .catch((error) => {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `ID ${productId} bilan mahsulot topilmadi`,
          );
        }
        throw error;
      });

    return {
      success: true,
      message: `${updatedProduct.name} ga ${quantityKg} kg qo‘shildi`,
      product: updatedProduct,
    };
  }

  async getCurrentStock() {
    return await this.db.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        tannarx: true,
        sotish: true,
        stockKg: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
