import { Injectable } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class KassaService {
  constructor(private db: PrismaService) {}

  private getDateRange(filter: string): { gte: Date; lt: Date } {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    if (filter === 'hafta') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return { gte: start, lt: end };
    }
    if (filter === 'oy') {
      start.setDate(1);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      return { gte: start, lt: end };
    }
    if (filter === 'yil') {
      start.setMonth(0, 1);
      const end = new Date(start);
      end.setFullYear(end.getFullYear() + 1);
      return { gte: start, lt: end };
    }
    // Default: bugun
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { gte: start, lt: end };
  }

  /**
   * GET /kassa?filter=bugun
   * Rasm 3 - Kassa nazorati: umumiy qoldiq, kirim, chiqim, tarixiy harakatlar
   */
  async getKassaNazorati(filter: string = 'bugun', search?: string) {
    const dateRange = this.getDateRange(filter);

    // Filterlangan sotuvlar (NAQD + KARTA = kirim)
    const sotuvlar = await this.db.prisma.sale.findMany({
      where: {
        paymentMethod: { in: [PaymentMethod.NAQD, PaymentMethod.KARTA] },
        createdAt: dateRange,
      },
      include: {
        items: { include: { product: true } },
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const jamiKirim = sotuvlar.reduce(
      (sum, s) => sum + Number(s.totalAmount),
      0,
    );
    const jamiChiqim = 0; // Kelajakda chiqim modeli qo'shilganda

    // Barcha vaqtdagi NAQD+KARTA qoldiq
    const barchaKirims = await this.db.prisma.sale.findMany({
      where: {
        paymentMethod: { in: [PaymentMethod.NAQD, PaymentMethod.KARTA] },
      },
    });
    const umumiyQoldiq = barchaKirims.reduce(
      (sum, s) => sum + Number(s.totalAmount),
      0,
    );

    // Tarixiy harakatlar (search bilan filterlash)
    let harakatlar = sotuvlar.map((s) => ({
      id: s.id,
      sana: s.createdAt,
      izoh: s.items.map((i) => i.product.name).join(', ') || 'Savdo',
      turi: s.paymentMethod,
      miqdor: Number(s.totalAmount),
      amal: 'KIRIM' as const,
    }));

    if (search) {
      const q = search.toLowerCase();
      harakatlar = harakatlar.filter(
        (h) =>
          h.izoh.toLowerCase().includes(q) || h.turi.toLowerCase().includes(q),
      );
    }

    return {
      umumiyQoldiq,
      jamiKirim,
      jamiChiqim,
      filter,
      tarixiyHarakatlar: harakatlar,
    };
  }

  /**
   * GET /kassa/statistika?filter=bugun
   * NAQD, KARTA, NASIYA alohida-alohida statistika
   */
  async getKassaStatistika(filter: string = 'bugun') {
    const dateRange = this.getDateRange(filter);

    const [naqdSotuvlar, kartaSotuvlar, nasiyaSotuvlar] = await Promise.all([
      this.db.prisma.sale.findMany({
        where: { paymentMethod: PaymentMethod.NAQD, createdAt: dateRange },
      }),
      this.db.prisma.sale.findMany({
        where: { paymentMethod: PaymentMethod.KARTA, createdAt: dateRange },
      }),
      this.db.prisma.sale.findMany({
        where: { paymentMethod: PaymentMethod.NASIYA, createdAt: dateRange },
        include: { customer: true },
      }),
    ]);

    const naqdJami = naqdSotuvlar.reduce(
      (sum, s) => sum + Number(s.totalAmount),
      0,
    );
    const kartaJami = kartaSotuvlar.reduce(
      (sum, s) => sum + Number(s.totalAmount),
      0,
    );
    const nasiyaJami = nasiyaSotuvlar.reduce(
      (sum, s) => sum + Number(s.totalAmount),
      0,
    );

    return {
      filter,
      naqd: { summa: naqdJami, sotuvlarSoni: naqdSotuvlar.length },
      karta: { summa: kartaJami, sotuvlarSoni: kartaSotuvlar.length },
      nasiya: { summa: nasiyaJami, sotuvlarSoni: nasiyaSotuvlar.length },
      jami: naqdJami + kartaJami + nasiyaJami,
    };
  }
}
