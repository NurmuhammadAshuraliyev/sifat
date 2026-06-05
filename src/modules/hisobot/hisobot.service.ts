// import { Injectable } from '@nestjs/common';
// import { PaymentMethod } from '@prisma/client';
// import { PrismaService } from 'src/core/database/prisma.service';

// @Injectable()
// export class HisobotService {
//   constructor(private db: PrismaService) {}

//   // private getDateRange(filter: string): { gte: Date; lt: Date } {
//   //   const start = new Date();
//   //   start.setHours(0, 0, 0, 0);

//   //   if (filter === 'hafta') {
//   //     const day = start.getDay();
//   //     const diff = start.getDate() - day + (day === 0 ? -6 : 1);
//   //     start.setDate(diff);
//   //     const end = new Date(start);
//   //     end.setDate(end.getDate() + 7);
//   //     return { gte: start, lt: end };
//   //   }
//   //   if (filter === 'oy') {
//   //     start.setDate(1);
//   //     const end = new Date(start);
//   //     end.setMonth(end.getMonth() + 1);
//   //     return { gte: start, lt: end };
//   //   }
//   //   if (filter === 'yil') {
//   //     start.setMonth(0, 1);
//   //     const end = new Date(start);
//   //     end.setFullYear(end.getFullYear() + 1);
//   //     return { gte: start, lt: end };
//   //   }
//   //   // Default: kun (bugun)
//   //   const end = new Date(start);
//   //   end.setDate(end.getDate() + 1);
//   //   return { gte: start, lt: end };
//   // }

//   // private getDateRange(filter: string): { gte: Date; lt: Date } {
//   //   const now = new Date();
//   //   const end = new Date(); // lt = hozir (yoki ertaning boshi)

//   //   if (filter === 'hafta') {
//   //     const start = new Date(now);
//   //     start.setDate(now.getDate() - 7); // Oxirgi 7 kun
//   //     start.setHours(0, 0, 0, 0);
//   //     return { gte: start, lt: end };
//   //   }
//   //   if (filter === 'oy') {
//   //     const start = new Date(now);
//   //     start.setDate(now.getDate() - 30); // Oxirgi 30 kun
//   //     start.setHours(0, 0, 0, 0);
//   //     return { gte: start, lt: end };
//   //   }
//   //   if (filter === 'yil') {
//   //     const start = new Date(now);
//   //     start.setFullYear(now.getFullYear() - 1); // Oxirgi 1 yil
//   //     start.setHours(0, 0, 0, 0);
//   //     return { gte: start, lt: end };
//   //   }
//   //   // Default: bugun (kun)
//   //   const start = new Date(now);
//   //   start.setHours(0, 0, 0, 0);
//   //   const dayEnd = new Date(now);
//   //   dayEnd.setHours(23, 59, 59, 999);
//   //   return { gte: start, lt: dayEnd };
//   // }

//   private getDateRange(filter: string): { gte: Date; lt: Date } {
//     // Uzbekiston UTC+5
//     const now = new Date();
//     const offset = 5 * 60; // daqiqalarda
//     const uzNow = new Date(now.getTime() + offset * 60 * 1000);

//     if (filter === 'hafta') {
//       const start = new Date(uzNow);
//       start.setDate(uzNow.getDate() - 7);
//       start.setHours(0, 0, 0, 0);
//       // UTC ga qaytarish
//       return {
//         gte: new Date(start.getTime() - offset * 60 * 1000),
//         lt: now,
//       };
//     }
//     if (filter === 'oy') {
//       const start = new Date(uzNow);
//       start.setDate(uzNow.getDate() - 30);
//       start.setHours(0, 0, 0, 0);
//       return {
//         gte: new Date(start.getTime() - offset * 60 * 1000),
//         lt: now,
//       };
//     }
//     if (filter === 'yil') {
//       const start = new Date(uzNow);
//       start.setFullYear(uzNow.getFullYear() - 1);
//       start.setHours(0, 0, 0, 0);
//       return {
//         gte: new Date(start.getTime() - offset * 60 * 1000),
//         lt: now,
//       };
//     }

//     // kun - bugungi UZ vaqt bo'yicha
//     const startUz = new Date(uzNow);
//     startUz.setHours(0, 0, 0, 0);
//     const endUz = new Date(uzNow);
//     endUz.setHours(23, 59, 59, 999);

//     return {
//       gte: new Date(startUz.getTime() - offset * 60 * 1000),
//       lt: new Date(endUz.getTime() - offset * 60 * 1000),
//     };
//   }

//   /**
//    * GET /hisobot?filter=kun|hafta|oy|yil
//    * Rasm 4 - HISOBOTLAR sahifasi:
//    *   - Umumiy savdo (NAQD + KARTA qismlari bilan)
//    *   - Sof foyda (tannarxdan tashqari)
//    *   - Undirilgan qarzlar
//    *   - Savdo tarixi
//    *   - Undirilgan qarzlar ro'yxati
//    */
//   async getHisobot(filter: string = 'kun') {
//     const dateRange = this.getDateRange(filter);

//     // Filterlangan sotuvlar
//     const sotuvlar = await this.db.prisma.sale.findMany({
//       where: { createdAt: dateRange },
//       include: {
//         items: {
//           include: { product: true },
//         },
//         customer: true,
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     // NAQD sotuvlar
//     const naqdSotuvlar = sotuvlar.filter(
//       (s) => s.paymentMethod === PaymentMethod.NAQD,
//     );
//     const naqdJami = naqdSotuvlar.reduce(
//       (sum, s) => sum + Number(s.totalAmount),
//       0,
//     );

//     // KARTA sotuvlar
//     const kartaSotuvlar = sotuvlar.filter(
//       (s) => s.paymentMethod === PaymentMethod.KARTA,
//     );
//     const kartaJami = kartaSotuvlar.reduce(
//       (sum, s) => sum + Number(s.totalAmount),
//       0,
//     );

//     // NASIYA sotuvlar
//     const nasiyaSotuvlar = sotuvlar.filter(
//       (s) => s.paymentMethod === PaymentMethod.NASIYA,
//     );
//     const nasiyaJami = nasiyaSotuvlar.reduce(
//       (sum, s) => sum + Number(s.totalAmount),
//       0,
//     );

//     // Umumiy savdo
//     const umumiySavdo = naqdJami + kartaJami + nasiyaJami;

//     // Sof foyda (tannarxdan tashqari foyda)
//     const allItems = sotuvlar.flatMap((s) => s.items);
//     const sofFoyda = allItems.reduce((sum, item) => {
//       return (
//         sum +
//         (Number(item.pricePerKg) - Number(item.costPerKg)) *
//           Number(item.quantityKg)
//       );
//     }, 0);

//     // Undirilgan qarzlar = bu davrdagi nasiya sotuvlar uchun to'langan pullar
//     // (Bu yerda customer.totalDebt o'zgarishini track qilish kerak bo'ladi
//     // Hozircha nasiya sotuvlar summasini ko'rsatamiz)
//     // Ideal: alohida Payment/Repayment model kerak
//     const undirilganQarzlar = nasiyaJami; // Soddalashtirilgan

//     // Savdo tarixi (rasm 4 - SAVDO TARIXI bo'limi)
//     const savdoTarixi = sotuvlar.map((s) => ({
//       id: s.id,
//       sana: s.createdAt,
//       mijoz: s.customer?.name || null,
//       tolovTuri: s.paymentMethod,
//       summa: Number(s.totalAmount),
//       mahsulotlar: s.items.map((item) => ({
//         nomi: item.product.name,
//         kategoriya: item.product.category,
//         miqdorKg: Number(item.quantityKg),
//         narxPerKg: Number(item.pricePerKg),
//         tannarxPerKg: Number(item.costPerKg),
//         jami: Number(item.quantityKg) * Number(item.pricePerKg),
//         foyda:
//           (Number(item.pricePerKg) - Number(item.costPerKg)) *
//           Number(item.quantityKg),
//       })),
//     }));

//     // Undirilgan qarzlar ro'yxati (rasm 4 - UNDIRILGAN QARZLAR bo'limi)
//     const undirilganQarzlarRoyxati = nasiyaSotuvlar.map((s) => ({
//       id: s.id,
//       sana: s.createdAt,
//       mijoz: s.customer?.name || "Noma'lum",
//       telefon: s.customer?.phone || null,
//       summa: Number(s.totalAmount),
//       qolganQarz: Number(s.customer?.totalDebt || 0),
//     }));

//     return {
//       filter,
//       sana: dateRange,
//       // Top kartochkalar (rasm 4 yuqori qismi)
//       umumiySavdo: {
//         summa: umumiySavdo,
//         naqd: naqdJami,
//         karta: kartaJami,
//         label: 'UMUMIY SAVDO',
//       },
//       sofFoyda: {
//         summa: sofFoyda,
//         label: 'SOF FOYDA',
//         description: 'TANNARXDAN TASHQARI',
//       },
//       undirilganQarzlarJami: {
//         summa: undirilganQarzlar,
//         label: 'UNDIRILGAN QARZLAR',
//         description: 'KASSAGA KIRGAN QARZ PULLARI',
//       },
//       // Ro'yxatlar
//       savdoTarixi,
//       undirilganQarzlarRoyxati,
//       // Qo'shimcha statistika
//       statistika: {
//         sotuvlarSoni: sotuvlar.length,
//         naqdSoni: naqdSotuvlar.length,
//         kartaSoni: kartaSotuvlar.length,
//         nasiyaSoni: nasiyaSotuvlar.length,
//       },
//     };
//   }

//   /**
//    * GET /hisobot/top-mahsulotlar?filter=kun|hafta|oy|yil
//    * Eng ko'p sotilgan mahsulotlar
//    */
//   async getTopMahsulotlar(filter: string = 'kun') {
//     const dateRange = this.getDateRange(filter);

//     const saleItems = await this.db.prisma.saleItem.findMany({
//       where: {
//         sale: { createdAt: dateRange },
//       },
//       include: {
//         product: true,
//         sale: true,
//       },
//     });

//     // Mahsulot bo'yicha guruhlash
//     const mahsulotMap = new Map<
//       string,
//       {
//         mahsulot: string;
//         kategoriya: string;
//         jamiKg: number;
//         jamiSumma: number;
//         jamiFoyda: number;
//         sotuvlarSoni: number;
//       }
//     >();

//     for (const item of saleItems) {
//       const existing = mahsulotMap.get(item.productId);
//       const foyda =
//         (Number(item.pricePerKg) - Number(item.costPerKg)) *
//         Number(item.quantityKg);

//       if (existing) {
//         existing.jamiKg += Number(item.quantityKg);
//         existing.jamiSumma += Number(item.quantityKg) * Number(item.pricePerKg);
//         existing.jamiFoyda += foyda;
//         existing.sotuvlarSoni += 1;
//       } else {
//         mahsulotMap.set(item.productId, {
//           mahsulot: item.product.name,
//           kategoriya: item.product.category,
//           jamiKg: Number(item.quantityKg),
//           jamiSumma: Number(item.quantityKg) * Number(item.pricePerKg),
//           jamiFoyda: foyda,
//           sotuvlarSoni: 1,
//         });
//       }
//     }

//     const topMahsulotlar = Array.from(mahsulotMap.values())
//       .sort((a, b) => b.jamiSumma - a.jamiSumma)
//       .slice(0, 10);

//     return { filter, topMahsulotlar };
//   }
// }

////////

import { Injectable } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class HisobotService {
  constructor(private db: PrismaService) {}

  private getDateRange(filter: string): { gte: Date; lt: Date } {
    // Hozirgi UTC vaqt
    const now = new Date();

    // UTC+5 da bugungi sana
    const UZ_OFFSET_MS = 5 * 60 * 60 * 1000; // 5 soat ms da
    const uzNow = new Date(now.getTime() + UZ_OFFSET_MS);

    const y = uzNow.getUTCFullYear();
    const mo = uzNow.getUTCMonth();
    const d = uzNow.getUTCDate();

    // UTC+5 da bugungi kun 00:00 → UTC da (00:00 - 5soat) = oldingi kun 19:00
    const todayStart = new Date(Date.UTC(y, mo, d, 0, 0, 0, 0) - UZ_OFFSET_MS);
    // UTC+5 da bugungi kun 23:59:59 → UTC da 18:59:59
    const todayEnd = new Date(
      Date.UTC(y, mo, d, 23, 59, 59, 999) - UZ_OFFSET_MS,
    );

    if (filter === 'hafta') {
      const weekStart = new Date(todayStart);
      weekStart.setUTCDate(weekStart.getUTCDate() - 6);
      return { gte: weekStart, lt: todayEnd };
    }
    if (filter === 'oy') {
      const monthStart = new Date(todayStart);
      monthStart.setUTCDate(monthStart.getUTCDate() - 29);
      return { gte: monthStart, lt: todayEnd };
    }
    if (filter === 'yil') {
      const yearStart = new Date(todayStart);
      yearStart.setUTCFullYear(yearStart.getUTCFullYear() - 1);
      return { gte: yearStart, lt: todayEnd };
    }

    // 'kun' — default
    return { gte: todayStart, lt: todayEnd };
  }

  async getHisobot(filter: string = 'kun') {
    const dateRange = this.getDateRange(filter);

    // ── 1. SOTUVLAR ──────────────────────────────────────────────
    const sotuvlar = await this.db.prisma.sale.findMany({
      where: { createdAt: dateRange },
      include: {
        items: { include: { product: true } },
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const naqdSotuvlar = sotuvlar.filter(
      (s) => s.paymentMethod === PaymentMethod.NAQD,
    );
    const kartaSotuvlar = sotuvlar.filter(
      (s) => s.paymentMethod === PaymentMethod.KARTA,
    );
    const nasiyaSotuvlarSale = sotuvlar.filter(
      (s) => s.paymentMethod === PaymentMethod.NASIYA,
    );

    const naqdJami = naqdSotuvlar.reduce(
      (sum, s) => sum + Number(s.totalAmount),
      0,
    );
    const kartaJami = kartaSotuvlar.reduce(
      (sum, s) => sum + Number(s.totalAmount),
      0,
    );
    const nasiyaSaleJami = nasiyaSotuvlarSale.reduce(
      (sum, s) => sum + Number(s.totalAmount),
      0,
    );

    const allItems = sotuvlar.flatMap((s) => s.items);
    const sofFoyda = allItems.reduce((sum, item) => {
      return (
        sum +
        (Number(item.pricePerKg) - Number(item.costPerKg)) *
          Number(item.quantityKg)
      );
    }, 0);

    // ── 2. TO'G'RIDAN NASIYA (saleId = null) ─────────────────────
    const nasiyaToBir = await this.db.prisma.nasiya.findMany({
      where: {
        createdAt: dateRange,
        saleId: null,
      },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });

    const nasiyaToBirJami = nasiyaToBir.reduce(
      (sum, n) => sum + Number(n.aslSumma),
      0,
    );

    const nasiyaJami = nasiyaSaleJami + nasiyaToBirJami;
    const umumiySavdo = naqdJami + kartaJami + nasiyaJami;

    // ── 3. UNDIRILGAN QARZLAR ─────────────────────────────────────
    const undirilganTolovlar = await this.db.prisma.nasiyaTolov.findMany({
      where: { createdAt: dateRange },
      include: {
        nasiya: { include: { customer: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const undirilganJami = undirilganTolovlar.reduce(
      (sum, t) => sum + Number(t.summa),
      0,
    );

    // ── 4. OMBOR KIRIM ────────────────────────────────────────────
    const omborKirim = await this.db.prisma.transaction.findMany({
      where: { createdAt: dateRange, type: 'INCOME' },
      orderBy: { createdAt: 'desc' },
    });
    const omborKirimJami = omborKirim.reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );

    // ── 5. CHIQIMLAR ──────────────────────────────────────────────
    const chiqimlar = await this.db.prisma.transaction.findMany({
      where: { createdAt: dateRange, type: 'EXPENSE' },
      orderBy: { createdAt: 'desc' },
    });
    const chiqimlarJami = chiqimlar.reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );

    // ── 6. SAVDO TARIXI (sotuv + nasiya birlashtirilgan) ──────────
    const savdoTarixi = sotuvlar.map((s) => ({
      id: s.id,
      tur: 'SOTUV' as const,
      sana: s.createdAt,
      mijoz: s.customer?.name || null,
      tolovTuri: s.paymentMethod,
      summa: Number(s.totalAmount),
      mahsulotlar: s.items.map((item) => ({
        nomi: item.product.name,
        kategoriya: item.product.category,
        miqdorKg: Number(item.quantityKg),
        narxPerKg: Number(item.pricePerKg),
        tannarxPerKg: Number(item.costPerKg),
        jami: Number(item.quantityKg) * Number(item.pricePerKg),
        foyda:
          (Number(item.pricePerKg) - Number(item.costPerKg)) *
          Number(item.quantityKg),
      })),
    }));

    const nasiyaTarixi = nasiyaToBir.map((n) => ({
      id: n.id,
      tur: 'NASIYA' as const,
      sana: n.createdAt,
      mijoz: n.customer?.name || null,
      tolovTuri: 'NASIYA',
      summa: Number(n.aslSumma),
      izoh: n.izoh || null,
      mahsulotlar: [],
    }));

    const barchaVoqealar = [...savdoTarixi, ...nasiyaTarixi].sort(
      (a, b) => new Date(b.sana).getTime() - new Date(a.sana).getTime(),
    );

    // ── 7. UNDIRILGAN RO'YXAT ─────────────────────────────────────
    const undirilganQarzlarRoyxati = undirilganTolovlar.map((t) => ({
      id: t.id,
      sana: t.createdAt,
      mijoz: t.nasiya?.customer?.name || "Noma'lum",
      telefon: t.nasiya?.customer?.phone || null,
      summa: Number(t.summa),
      izoh: t.izoh || null,
    }));

    // ── 8. OMBOR / CHIQIM RO'YXAT ────────────────────────────────
    const omborRoyxati = omborKirim.map((t) => ({
      id: t.id,
      sana: t.createdAt,
      tur: 'KIRIM' as const,
      tavsif: t.description,
      summa: Number(t.amount),
    }));

    const chiqimRoyxati = chiqimlar.map((t) => ({
      id: t.id,
      sana: t.createdAt,
      tur: 'CHIQIM' as const,
      tavsif: t.description,
      summa: Number(t.amount),
    }));

    // ── DEBUG: range ni log qilamiz (deploy dan keyin olib tashlash mumkin)
    console.log('📅 DATE RANGE:', {
      filter,
      gte: dateRange.gte.toISOString(),
      lt: dateRange.lt.toISOString(),
      nasiyaToBirSoni: nasiyaToBir.length,
      sotuvlarSoni: sotuvlar.length,
    });

    return {
      filter,
      sana: dateRange,

      umumiySavdo: {
        summa: umumiySavdo,
        naqd: naqdJami,
        karta: kartaJami,
        nasiya: nasiyaJami,
        nasiyaSale: nasiyaSaleJami,
        nasiyaToBir: nasiyaToBirJami,
        label: 'UMUMIY SAVDO',
      },
      sofFoyda: {
        summa: sofFoyda,
        label: 'SOF FOYDA',
        description: 'TANNARXDAN TASHQARI',
      },
      undirilganQarzlarJami: {
        summa: undirilganJami,
        label: 'UNDIRILGAN QARZLAR',
        description: 'KASSAGA KIRGAN QARZ PULLARI',
      },
      omborKirim: {
        summa: omborKirimJami,
        label: 'OMBOR KIRIM',
      },
      chiqimlar: {
        summa: chiqimlarJami,
        label: 'CHIQIMLAR',
      },
      kassaBalansi: {
        summa: naqdJami + kartaJami + undirilganJami - chiqimlarJami,
        label: 'KASSA BALANSI',
      },

      savdoTarixi: barchaVoqealar,
      undirilganQarzlarRoyxati,
      omborRoyxati,
      chiqimRoyxati,

      statistika: {
        sotuvlarSoni: sotuvlar.length,
        naqdSoni: naqdSotuvlar.length,
        kartaSoni: kartaSotuvlar.length,
        nasiyaSoni: nasiyaSotuvlarSale.length + nasiyaToBir.length,
        undirilganTolovlarSoni: undirilganTolovlar.length,
        omborKirimSoni: omborKirim.length,
        chiqimlarSoni: chiqimlar.length,
      },
    };
  }

  async getTopMahsulotlar(filter: string = 'kun') {
    const dateRange = this.getDateRange(filter);

    const saleItems = await this.db.prisma.saleItem.findMany({
      where: { sale: { createdAt: dateRange } },
      include: { product: true },
    });

    const mahsulotMap = new Map<string, any>();

    for (const item of saleItems) {
      const existing = mahsulotMap.get(item.productId);
      const foyda =
        (Number(item.pricePerKg) - Number(item.costPerKg)) *
        Number(item.quantityKg);

      if (existing) {
        existing.jamiKg += Number(item.quantityKg);
        existing.jamiSumma += Number(item.quantityKg) * Number(item.pricePerKg);
        existing.jamiFoyda += foyda;
        existing.sotuvlarSoni += 1;
      } else {
        mahsulotMap.set(item.productId, {
          mahsulot: item.product.name,
          kategoriya: item.product.category,
          jamiKg: Number(item.quantityKg),
          jamiSumma: Number(item.quantityKg) * Number(item.pricePerKg),
          jamiFoyda: foyda,
          sotuvlarSoni: 1,
        });
      }
    }

    return {
      filter,
      topMahsulotlar: Array.from(mahsulotMap.values())
        .sort((a, b) => b.jamiSumma - a.jamiSumma)
        .slice(0, 10),
    };
  }
}
