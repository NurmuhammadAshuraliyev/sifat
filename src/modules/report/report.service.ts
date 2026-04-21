import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { ReportPeriod } from './dto/report-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReportService {
  constructor(private readonly db: PrismaService) {}

  async generateReport(period: ReportPeriod = ReportPeriod.BUGUN) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case ReportPeriod.BUGUN:
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;

      case ReportPeriod.KECHA:
        startDate = new Date(now.setDate(now.getDate() - 1));
        startDate.setHours(0, 0, 0, 0);
        break;

      case ReportPeriod._7KUN:
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;

      case ReportPeriod._14KUN:
        startDate = new Date(now.setDate(now.getDate() - 14));
        break;

      case ReportPeriod.OY:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;

      case ReportPeriod.YIL:
        startDate = new Date(now.getFullYear(), 0, 1);
        break;

      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const sales = await this.db.prisma.sale.findMany({
      where: { createdAt: { gte: startDate } },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    let totalSales = new Prisma.Decimal(0);
    let totalCost = new Prisma.Decimal(0);
    const categoryStats: {
      [key: string]: { amount: Prisma.Decimal; qty: Prisma.Decimal };
    } = {};

    sales.forEach((sale) => {
      const saleTotal = new Prisma.Decimal(sale.totalAmount);
      totalSales = totalSales.add(saleTotal);

      sale.items.forEach((item) => {
        const qty = new Prisma.Decimal(item.quantityKg);
        const price = new Prisma.Decimal(item.pricePerKg);
        const cost = new Prisma.Decimal(item.costPerKg);

        totalCost = totalCost.add(cost.mul(qty));

        const cat = item.product?.category || 'OTHER';

        if (!categoryStats[cat]) {
          categoryStats[cat] = {
            amount: new Prisma.Decimal(0),
            qty: new Prisma.Decimal(0),
          };
        }

        categoryStats[cat].amount = categoryStats[cat].amount.add(
          price.mul(qty),
        );
        categoryStats[cat].qty = categoryStats[cat].qty.add(qty);
      });
    });

    const netProfit = totalSales.sub(totalCost);

    const totalRevenue = Number(totalSales);
    const shares = Object.entries(categoryStats).map(([category, stat]) => ({
      category,
      percent:
        totalRevenue > 0
          ? Math.round((Number(stat.amount) / totalRevenue) * 100)
          : 0,
      amount: Number(stat.amount),
      quantity: Number(stat.qty),
    }));

    // To'lov turlari bo'yicha hisob
    const cashIncome = sales
      .filter((s) => s.paymentMethod === 'NAQD')
      .reduce(
        (sum, s) => sum.add(new Prisma.Decimal(s.totalAmount)),
        new Prisma.Decimal(0),
      );

    const cardIncome = sales
      .filter((s) => s.paymentMethod === 'KARTA')
      .reduce(
        (sum, s) => sum.add(new Prisma.Decimal(s.totalAmount)),
        new Prisma.Decimal(0),
      );

    const nasiyaAmount = sales
      .filter((s) => s.paymentMethod === 'NASIYA')
      .reduce(
        (sum, s) => sum.add(new Prisma.Decimal(s.totalAmount)),
        new Prisma.Decimal(0),
      );

    return {
      period,
      totalSales: Number(totalSales),
      netProfit: Number(netProfit),
      cashIncome: Number(cashIncome),
      cardIncome: Number(cardIncome),
      nasiyaAmount: Number(nasiyaAmount),
      shares: shares.sort((a, b) => b.percent - a.percent),
      salesCount: sales.length,
      startDate: startDate.toISOString().split('T')[0],
    };
  }
}
