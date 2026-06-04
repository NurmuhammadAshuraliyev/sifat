import { Injectable } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private db: PrismaService) {}

  /**
   * Rasm 1 - STATISTIKA paneli uchun barcha ma'lumotlar:
   * - Real kelgan pul (NAQD + KARTA savdo + undirilgan qarzlar)
   * - Undirilgan qarzlar (to'langan nasiyalar)
   * - Hali olinishi kerak (qolgan nasiyalar)
   * - Umumiy savdo (NAQD + KARTA + NASIYA)
   * - Kutilayotgan umumiy pul (kelgan pul + qolgan qarzlar)
   * - Umumiy foyda (NAQD + KARTA + NASIYA foydasi)
   */
  async getStatistika() {
    // 1. Barcha sotuvlarni olish
    const allSales = await this.db.prisma.sale.findMany({
      include: {
        items: true,
        customer: true,
      },
    });

    // 2. NAQD va KARTA sotuvlar summasi
    const naqdKartaSales = allSales.filter(
      (s) =>
        s.paymentMethod === PaymentMethod.NAQD ||
        s.paymentMethod === PaymentMethod.KARTA,
    );
    const naqdKartaSumma = naqdKartaSales.reduce(
      (sum, s) => sum + Number(s.totalAmount),
      0,
    );

    // 3. Nasiya sotuvlar
    const nasiyaSales = allSales.filter(
      (s) => s.paymentMethod === PaymentMethod.NASIYA,
    );

    // 4. Barcha mijozlarning qarz holati
    const customers = await this.db.prisma.customer.findMany();

    // Jami qolgan qarz (hali olinmagan)
    const qolganNasiyalar = customers.reduce(
      (sum, c) => sum + Number(c.totalDebt),
      0,
    );

    // 5. Undirilgan qarzlar = Nasiya sotuvlar summasi - qolgan qarzlar
    // (ya'ni nasiya orqali kelgan, to'langan qism)
    const nasiyaSotuvJami = nasiyaSales.reduce(
      (sum, s) => sum + Number(s.totalAmount),
      0,
    );
    const undirilganQarzlar = nasiyaSotuvJami - qolganNasiyalar;

    // 6. Real kelgan pul = NAQD/KARTA savdo + undirilgan qarzlar
    const realKelganPul =
      naqdKartaSumma + (undirilganQarzlar > 0 ? undirilganQarzlar : 0);

    // 7. Umumiy savdo = barcha sotuvlar
    const umumiySavdo = allSales.reduce(
      (sum, s) => sum + Number(s.totalAmount),
      0,
    );

    // 8. Kutilayotgan umumiy pul = real kelgan pul + qolgan qarzlar
    const kutilayotganUmumiyPul = realKelganPul + qolganNasiyalar;

    // 9. Umumiy foyda hisoblash (sotuv - tannarx)
    const allSaleItems = await this.db.prisma.saleItem.findMany();
    const umumiyFoyda = allSaleItems.reduce((sum, item) => {
      const foyda =
        (Number(item.pricePerKg) - Number(item.costPerKg)) *
        Number(item.quantityKg);
      return sum + foyda;
    }, 0);

    return {
      realKelganPul: {
        summa: realKelganPul,
        label: 'REAL KELGAN PUL',
        description: 'NAQD/KARTA SAVDO + OLINGAN QARZLAR',
      },
      undirilganQarzlar: {
        summa: undirilganQarzlar > 0 ? undirilganQarzlar : 0,
        label: 'UNDIRILGAN QARZLAR',
        description: 'QARZDOR MIJOZLARDAN OLINGAN PUL',
      },
      haliOlinishiKerak: {
        summa: qolganNasiyalar,
        label: 'HALI OLINISHI KERAK',
        description: 'QOLGAN NASIYALAR',
      },
      umumiySavdo: {
        summa: umumiySavdo,
        label: 'UMUMIY SAVDO',
        description: 'NAQD + KARTA + NASIYA',
      },
      kutilayotganUmumiyPul: {
        summa: kutilayotganUmumiyPul,
        label: 'KUTILAYOTGAN UMUMIY PUL',
        description: 'KELGAN PUL + QOLGAN QARZLAR',
      },
      umumiyFoyda: {
        summa: umumiyFoyda,
        label: 'UMUMIY FOYDA',
        description: 'NAQD + KARTA + NASIYA FOYDASI',
      },
    };
  }

  private getDateRange(filter: string): { gte: Date; lt: Date; label: string } {
    const now = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    switch (filter) {
      case 'hafta': {
        // Haftaning dushanbasi
        const day = start.getDay(); // 0=yakshanba
        const diff = day === 0 ? -6 : 1 - day;
        start.setDate(start.getDate() + diff);
        const end = new Date(start);
        end.setDate(end.getDate() + 7);
        return { gte: start, lt: end, label: 'Bu hafta' };
      }
      case 'oy': {
        start.setDate(1);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        return { gte: start, lt: end, label: 'Bu oy' };
      }
      case 'yil': {
        start.setMonth(0, 1);
        const end = new Date(start);
        end.setFullYear(end.getFullYear() + 1);
        return { gte: start, lt: end, label: `${now.getFullYear()}-yil` };
      }
      case 'bugun':
      default: {
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        return { gte: start, lt: end, label: 'Bugun' };
      }
    }
  }

  /**
   * Bugungi statistika (LIVE tugmasi uchun)
   */
  // async getBugungiStatistika() {
  //   const bugun = new Date();
  //   bugun.setHours(0, 0, 0, 0);
  //   const ertaga = new Date(bugun);
  //   ertaga.setDate(ertaga.getDate() + 1);

  //   const bugungiSotuvlar = await this.db.prisma.sale.findMany({
  //     where: {
  //       createdAt: {
  //         gte: bugun,
  //         lt: ertaga,
  //       },
  //     },
  //     include: { items: true },
  //   });

  //   const naqdKartaSumma = bugungiSotuvlar
  //     .filter(
  //       (s) =>
  //         s.paymentMethod === PaymentMethod.NAQD ||
  //         s.paymentMethod === PaymentMethod.KARTA,
  //     )
  //     .reduce((sum, s) => sum + Number(s.totalAmount), 0);

  //   const nasiyaSumma = bugungiSotuvlar
  //     .filter((s) => s.paymentMethod === PaymentMethod.NASIYA)
  //     .reduce((sum, s) => sum + Number(s.totalAmount), 0);

  //   const umumiySavdo = bugungiSotuvlar.reduce(
  //     (sum, s) => sum + Number(s.totalAmount),
  //     0,
  //   );

  //   const umumiyFoyda = bugungiSotuvlar
  //     .flatMap((s) => s.items)
  //     .reduce((sum, item) => {
  //       return (
  //         sum +
  //         (Number(item.pricePerKg) - Number(item.costPerKg)) *
  //           Number(item.quantityKg)
  //       );
  //     }, 0);

  //   return {
  //     sana: bugun,
  //     naqdKartaSumma,
  //     nasiyaSumma,
  //     umumiySavdo,
  //     umumiyFoyda,
  //     sotuvlarSoni: bugungiSotuvlar.length,
  //   };
  // }

  async getPeriodStatistika(filter: string = 'bugun') {
    const { gte, lt, label } = this.getDateRange(filter);

    const sotuvlar = await this.db.prisma.sale.findMany({
      where: { createdAt: { gte, lt } },
      include: { items: true, customer: true },
    });

    // NAQD + KARTA
    const naqdKartaSotuvlar = sotuvlar.filter(
      (s) =>
        s.paymentMethod === PaymentMethod.NAQD ||
        s.paymentMethod === PaymentMethod.KARTA,
    );
    const naqdSumma = sotuvlar
      .filter((s) => s.paymentMethod === PaymentMethod.NAQD)
      .reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const kartaSumma = sotuvlar
      .filter((s) => s.paymentMethod === PaymentMethod.KARTA)
      .reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const naqdKartaSumma = naqdSumma + kartaSumma;

    // NASIYA
    const nasiyaSumma = sotuvlar
      .filter((s) => s.paymentMethod === PaymentMethod.NASIYA)
      .reduce((sum, s) => sum + Number(s.totalAmount), 0);

    // Umumiy savdo
    const umumiySavdo = sotuvlar.reduce(
      (sum, s) => sum + Number(s.totalAmount),
      0,
    );

    // Umumiy foyda (shu davr uchun)
    const umumiyFoyda = sotuvlar
      .flatMap((s) => s.items)
      .reduce(
        (sum, item) =>
          sum +
          (Number(item.pricePerKg) - Number(item.costPerKg)) *
            Number(item.quantityKg),
        0,
      );

    // Qolgan nasiyalar (barcha vaqt, o'zgarmaydi)
    const customers = await this.db.prisma.customer.findMany();
    const qolganNasiyalar = customers.reduce(
      (sum, c) => sum + Number(c.totalDebt),
      0,
    );

    // Undirilgan qarzlar = bu davrdagi nasiya sotuvlar
    // (soddalashtirilgan: shu davr nasiya sotuvlari summasidan qolgan qarz chiqariladi)
    const undirilganQarzlar = Math.max(nasiyaSumma - qolganNasiyalar, 0);

    // Real kelgan pul
    const realKelganPul = naqdKartaSumma + undirilganQarzlar;

    // Kutilayotgan umumiy pul
    const kutilayotganUmumiyPul = realKelganPul + qolganNasiyalar;

    return {
      filter,
      label,
      davr: { boshlanish: gte, tugash: lt },
      sotuvlarSoni: sotuvlar.length,

      // Kartochkalar uchun
      realKelganPul: {
        summa: realKelganPul,
        label: 'REAL KELGAN PUL',
        description: 'NAQD/KARTA SAVDO + OLINGAN QARZLAR',
      },
      undirilganQarzlar: {
        summa: undirilganQarzlar,
        label: 'UNDIRILGAN QARZLAR',
        description: 'QARZDOR MIJOZLARDAN OLINGAN PUL',
      },
      haliOlinishiKerak: {
        summa: qolganNasiyalar,
        label: 'HALI OLINISHI KERAK',
        description: 'QOLGAN NASIYALAR',
      },
      umumiySavdo: {
        summa: umumiySavdo,
        label: 'UMUMIY SAVDO',
        description: 'NAQD + KARTA + NASIYA',
        naqd: naqdSumma,
        karta: kartaSumma,
        nasiya: nasiyaSumma,
      },
      kutilayotganUmumiyPul: {
        summa: kutilayotganUmumiyPul,
        label: 'KUTILAYOTGAN UMUMIY PUL',
        description: 'KELGAN PUL + QOLGAN QARZLAR',
      },
      umumiyFoyda: {
        summa: umumiyFoyda,
        label: 'UMUMIY FOYDA',
        description: 'NAQD + KARTA + NASIYA FOYDASI',
      },
    };
  }
}
