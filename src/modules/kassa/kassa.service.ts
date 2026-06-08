// import { Injectable } from '@nestjs/common';
// import { PaymentMethod } from '@prisma/client';
// import { PrismaService } from 'src/core/database/prisma.service';

// @Injectable()
// export class KassaService {
//   constructor(private db: PrismaService) {}

//   private getDateRange(filter: string): { gte: Date; lt: Date } {
//     const start = new Date();
//     start.setHours(0, 0, 0, 0);

//     if (filter === 'hafta') {
//       const day = start.getDay();
//       const diff = start.getDate() - day + (day === 0 ? -6 : 1);
//       start.setDate(diff);
//       const end = new Date(start);
//       end.setDate(end.getDate() + 7);
//       return { gte: start, lt: end };
//     }
//     if (filter === 'oy') {
//       start.setDate(1);
//       const end = new Date(start);
//       end.setMonth(end.getMonth() + 1);
//       return { gte: start, lt: end };
//     }
//     if (filter === 'yil') {
//       start.setMonth(0, 1);
//       const end = new Date(start);
//       end.setFullYear(end.getFullYear() + 1);
//       return { gte: start, lt: end };
//     }
//     // Default: bugun
//     const end = new Date(start);
//     end.setDate(end.getDate() + 1);
//     return { gte: start, lt: end };
//   }

//   /**
//    * GET /kassa?filter=bugun
//    * Rasm 3 - Kassa nazorati: umumiy qoldiq, kirim, chiqim, tarixiy harakatlar
//    */
//   async getKassaNazorati(filter: string = 'bugun', search?: string) {
//     const dateRange = this.getDateRange(filter);

//     // Filterlangan sotuvlar (NAQD + KARTA = kirim)
//     const sotuvlar = await this.db.prisma.sale.findMany({
//       where: {
//         paymentMethod: { in: [PaymentMethod.NAQD, PaymentMethod.KARTA] },
//         createdAt: dateRange,
//       },
//       include: {
//         items: { include: { product: true } },
//         customer: true,
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     const jamiKirim = sotuvlar.reduce(
//       (sum, s) => sum + Number(s.totalAmount),
//       0,
//     );
//     const jamiChiqim = 0; // Kelajakda chiqim modeli qo'shilganda

//     // Barcha vaqtdagi NAQD+KARTA qoldiq
//     const barchaKirims = await this.db.prisma.sale.findMany({
//       where: {
//         paymentMethod: { in: [PaymentMethod.NAQD, PaymentMethod.KARTA] },
//       },
//     });
//     const umumiyQoldiq = barchaKirims.reduce(
//       (sum, s) => sum + Number(s.totalAmount),
//       0,
//     );

//     // Tarixiy harakatlar (search bilan filterlash)
//     let harakatlar = sotuvlar.map((s) => ({
//       id: s.id,
//       sana: s.createdAt,
//       izoh: s.items.map((i) => i.product.name).join(', ') || 'Savdo',
//       turi: s.paymentMethod,
//       miqdor: Number(s.totalAmount),
//       amal: 'KIRIM' as const,
//     }));

//     if (search) {
//       const q = search.toLowerCase();
//       harakatlar = harakatlar.filter(
//         (h) =>
//           h.izoh.toLowerCase().includes(q) || h.turi.toLowerCase().includes(q),
//       );
//     }

//     return {
//       umumiyQoldiq,
//       jamiKirim,
//       jamiChiqim,
//       filter,
//       tarixiyHarakatlar: harakatlar,
//     };
//   }

//   /**
//    * GET /kassa/statistika?filter=bugun
//    * NAQD, KARTA, NASIYA alohida-alohida statistika
//    */
//   async getKassaStatistika(filter: string = 'bugun') {
//     const dateRange = this.getDateRange(filter);

//     const [naqdSotuvlar, kartaSotuvlar, nasiyaSotuvlar] = await Promise.all([
//       this.db.prisma.sale.findMany({
//         where: { paymentMethod: PaymentMethod.NAQD, createdAt: dateRange },
//       }),
//       this.db.prisma.sale.findMany({
//         where: { paymentMethod: PaymentMethod.KARTA, createdAt: dateRange },
//       }),
//       this.db.prisma.sale.findMany({
//         where: { paymentMethod: PaymentMethod.NASIYA, createdAt: dateRange },
//         include: { customer: true },
//       }),
//     ]);

//     const naqdJami = naqdSotuvlar.reduce(
//       (sum, s) => sum + Number(s.totalAmount),
//       0,
//     );
//     const kartaJami = kartaSotuvlar.reduce(
//       (sum, s) => sum + Number(s.totalAmount),
//       0,
//     );
//     const nasiyaJami = nasiyaSotuvlar.reduce(
//       (sum, s) => sum + Number(s.totalAmount),
//       0,
//     );

//     return {
//       filter,
//       naqd: { summa: naqdJami, sotuvlarSoni: naqdSotuvlar.length },
//       karta: { summa: kartaJami, sotuvlarSoni: kartaSotuvlar.length },
//       nasiya: { summa: nasiyaJami, sotuvlarSoni: nasiyaSotuvlar.length },
//       jami: naqdJami + kartaJami + nasiyaJami,
//     };
//   }
// }

//////////////////
import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { PrismaService } from 'src/core/database/prisma.service';

// Frontend'dan kelayotgan barcha formatni qabul qiladi
export class CreateKassaHarakatDto {
  amalTuri?: string; // "KIRIM" | "CHIQIM"
  type?: string; // "income" | "expense"
  summa?: number; // backend nomi
  amount?: number; // frontend nomi
  izoh?: string; // backend nomi
  description?: string; // frontend nomi
  tolovTuri?: string;
}

@Injectable()
export class KassaService {
  constructor(private db: PrismaService) {}

  private resolveType(dto: CreateKassaHarakatDto): TransactionType {
    const raw = (dto.amalTuri || dto.type || '').toLowerCase();
    if (raw === 'kirim' || raw === 'income') return TransactionType.INCOME;
    if (raw === 'chiqim' || raw === 'expense') return TransactionType.EXPENSE;
    return TransactionType.INCOME;
  }

  private getDateRange(filter: string): { gte: Date; lt: Date } {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    if (filter === 'hafta') {
      const day = start.getDay();
      start.setDate(start.getDate() - day + (day === 0 ? -6 : 1));
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
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { gte: start, lt: end };
  }

  async getKassaNazorati(filter: string = 'bugun', search?: string) {
    const dateRange = this.getDateRange(filter);

    const transactions = await this.db.prisma.transaction.findMany({
      where: { createdAt: dateRange },
      orderBy: { createdAt: 'desc' },
    });

    const allTx = await this.db.prisma.transaction.findMany();
    const umumiyQoldiq = allTx.reduce((sum, t) => {
      const a = Number(t.amount);
      return t.type === TransactionType.INCOME ? sum + a : sum - a;
    }, 0);

    const jamiKirim = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const jamiChiqim = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    let harakatlar = transactions.map((t) => ({
      id: t.id,
      sana: t.createdAt,
      createdAt: t.createdAt,
      izoh: t.description,
      description: t.description,
      turi: t.type === TransactionType.INCOME ? 'KIRIM' : 'CHIQIM',
      type: t.type === TransactionType.INCOME ? 'INCOME' : 'EXPENSE',
      miqdor: Number(t.amount),
      summa: Number(t.amount),
      amount: Number(t.amount),
      amal: t.type === TransactionType.INCOME ? 'KIRIM' : 'CHIQIM',
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
      balance: umumiyQoldiq,
      jamiKirim,
      totalIncome: jamiKirim,
      jamiChiqim,
      totalExpense: jamiChiqim,
      filter,
      tarixiyHarakatlar: harakatlar,
      transactions: harakatlar,
    };
  }

  async createKassaHarakat(dto: CreateKassaHarakatDto) {
    const type = this.resolveType(dto);
    const summa = Number(dto.summa ?? dto.amount ?? 0);
    const izoh = dto.izoh || dto.description || '';

    const transaction = await this.db.prisma.transaction.create({
      data: { amount: summa, description: izoh, type },
    });

    return {
      success: true,
      message:
        type === TransactionType.INCOME
          ? "Kirim muvaffaqiyatli qo'shildi"
          : "Chiqim muvaffaqiyatli qo'shildi",
      data: {
        id: transaction.id,
        summa: Number(transaction.amount),
        amount: Number(transaction.amount),
        izoh: transaction.description,
        description: transaction.description,
        turi: type === TransactionType.INCOME ? 'KIRIM' : 'CHIQIM',
        type: type === TransactionType.INCOME ? 'INCOME' : 'EXPENSE',
        sana: transaction.createdAt,
        createdAt: transaction.createdAt,
      },
    };
  }

  async deleteKassaHarakat(id: string) {
    const existing = await this.db.prisma.transaction.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException(`Tranzaksiya topilmadi: ${id}`);
    await this.db.prisma.transaction.delete({ where: { id } });
    return { success: true, message: "Tranzaksiya muvaffaqiyatli o'chirildi" };
  }

  async getKassaStatistika(filter: string = 'bugun') {
    const dateRange = this.getDateRange(filter);
    const [kirimlar, chiqimlar] = await Promise.all([
      this.db.prisma.transaction.findMany({
        where: { type: TransactionType.INCOME, createdAt: dateRange },
      }),
      this.db.prisma.transaction.findMany({
        where: { type: TransactionType.EXPENSE, createdAt: dateRange },
      }),
    ]);

    const kirimJami = kirimlar.reduce((sum, t) => sum + Number(t.amount), 0);
    const chiqimJami = chiqimlar.reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      filter,
      kirim: { summa: kirimJami, tranzaksiyalarSoni: kirimlar.length },
      chiqim: { summa: chiqimJami, tranzaksiyalarSoni: chiqimlar.length },
      totalIncome: kirimJami,
      totalExpense: chiqimJami,
      sofFoyda: kirimJami - chiqimJami,
      jami: kirimJami + chiqimJami,
    };
  }
}
