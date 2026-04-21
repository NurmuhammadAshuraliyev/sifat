// src/receipt/receipt.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class ReceiptService {
  private readonly SHOP_NAME = 'SIFAT BROYLER 006'; // ← Bu yerni o'zgartirsangiz yetarli

  constructor(private readonly db: PrismaService) {}

  async generateReceipt(saleId: string): Promise<{ text: string; sale?: any }> {
    const sale = await this.db.prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException(`ID ${saleId} bilan sotuv topilmadi`);
    }

    const receiptText = this.buildReceiptText(sale);

    return {
      text: receiptText,
      sale: {
        id: sale.id,
        totalAmount: Number(sale.totalAmount),
        paymentMethod: sale.paymentMethod,
        createdAt: sale.createdAt,
      },
    };
  }

  private buildReceiptText(sale: any): string {
    const date = new Date(sale.createdAt).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const time = new Date(sale.createdAt).toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const paymentType = sale.paymentMethod === 'NAQD' ? 'Naqd' : 'Karta';

    // Mahsulotlar ro‘yxatini rasmdagidek shakllantirish
    let itemsList = '';
    sale.items.forEach((item: any, index: number) => {
      const qty = Number(item.quantityKg);
      const price = Number(item.pricePerKg);
      const subtotal = Math.round(qty * price);

      itemsList += `${index + 1}. ${item.product.name}   ${qty} kg x ${price.toLocaleString('uz-UZ')} = ${subtotal.toLocaleString('uz-UZ')} so'm\n`;
    });

    const total = Number(sale.totalAmount);

    return `
${this.SHOP_NAME}
Halol va sifatli go'sht

Sana: ${date}
Vaqt: ${time}
Kassa: #01
Sotuvchi: Admin

Mahsulotlar:
${itemsList}
Jami:                  ${total.toLocaleString('uz-UZ')} so'm
To'lov:                ${total.toLocaleString('uz-UZ')} so'm
To'lov turi:           ${paymentType}

Xaridingiz uchun rahmat!
${this.SHOP_NAME}
Tel: +998 90 123 45 67
    `.trim();
  }
}
