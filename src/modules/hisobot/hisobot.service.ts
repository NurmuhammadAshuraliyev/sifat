import { Injectable } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class HisobotService {
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
    // Default: kun (bugun)
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { gte: start, lt: end };
  }

  /**
   * GET /hisobot?filter=kun|hafta|oy|yil
   * Rasm 4 - HISOBOTLAR sahifasi:
   *   - Umumiy savdo (NAQD + KARTA qismlari bilan)
   *   - Sof foyda (tannarxdan tashqari)
   *   - Undirilgan qarzlar
   *   - Savdo tarixi
   *   - Undirilgan qarzlar ro'yxati
   */
  async getHisobot(filter: string = 'kun') {
    const dateRange = this.getDateRange(filter);

    // Filterlangan sotuvlar
    const sotuvlar = await this.db.prisma.sale.findMany({
      where: { createdAt: dateRange },
      include: {
        items: {
          include: { product: true },
        },
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // NAQD sotuvlar
    const naqdSotuvlar = sotuvlar.filter(
      (s) => s.paymentMethod === PaymentMethod.NAQD,
    );
    const naqdJami = naqdSotuvlar.reduce(
      (sum, s) => sum + Number(s.totalAmount),
      0,
    );

    // KARTA sotuvlar
    const kartaSotuvlar = sotuvlar.filter(
      (s) => s.paymentMethod === PaymentMethod.KARTA,
    );
    const kartaJami = kartaSotuvlar.reduce(
      (sum, s) => sum + Number(s.totalAmount),
      0,
    );

    // NASIYA sotuvlar
    const nasiyaSotuvlar = sotuvlar.filter(
      (s) => s.paymentMethod === PaymentMethod.NASIYA,
    );
    const nasiyaJami = nasiyaSotuvlar.reduce(
      (sum, s) => sum + Number(s.totalAmount),
      0,
    );

    // Umumiy savdo
    const umumiySavdo = naqdJami + kartaJami + nasiyaJami;

    // Sof foyda (tannarxdan tashqari foyda)
    const allItems = sotuvlar.flatMap((s) => s.items);
    const sofFoyda = allItems.reduce((sum, item) => {
      return (
        sum +
        (Number(item.pricePerKg) - Number(item.costPerKg)) *
          Number(item.quantityKg)
      );
    }, 0);

    // Undirilgan qarzlar = bu davrdagi nasiya sotuvlar uchun to'langan pullar
    // (Bu yerda customer.totalDebt o'zgarishini track qilish kerak bo'ladi
    // Hozircha nasiya sotuvlar summasini ko'rsatamiz)
    // Ideal: alohida Payment/Repayment model kerak
    const undirilganQarzlar = nasiyaJami; // Soddalashtirilgan

    // Savdo tarixi (rasm 4 - SAVDO TARIXI bo'limi)
    const savdoTarixi = sotuvlar.map((s) => ({
      id: s.id,
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

    // Undirilgan qarzlar ro'yxati (rasm 4 - UNDIRILGAN QARZLAR bo'limi)
    const undirilganQarzlarRoyxati = nasiyaSotuvlar.map((s) => ({
      id: s.id,
      sana: s.createdAt,
      mijoz: s.customer?.name || "Noma'lum",
      telefon: s.customer?.phone || null,
      summa: Number(s.totalAmount),
      qolganQarz: Number(s.customer?.totalDebt || 0),
    }));

    return {
      filter,
      sana: dateRange,
      // Top kartochkalar (rasm 4 yuqori qismi)
      umumiySavdo: {
        summa: umumiySavdo,
        naqd: naqdJami,
        karta: kartaJami,
        label: 'UMUMIY SAVDO',
      },
      sofFoyda: {
        summa: sofFoyda,
        label: 'SOF FOYDA',
        description: 'TANNARXDAN TASHQARI',
      },
      undirilganQarzlarJami: {
        summa: undirilganQarzlar,
        label: 'UNDIRILGAN QARZLAR',
        description: 'KASSAGA KIRGAN QARZ PULLARI',
      },
      // Ro'yxatlar
      savdoTarixi,
      undirilganQarzlarRoyxati,
      // Qo'shimcha statistika
      statistika: {
        sotuvlarSoni: sotuvlar.length,
        naqdSoni: naqdSotuvlar.length,
        kartaSoni: kartaSotuvlar.length,
        nasiyaSoni: nasiyaSotuvlar.length,
      },
    };
  }

  /**
   * GET /hisobot/top-mahsulotlar?filter=kun|hafta|oy|yil
   * Eng ko'p sotilgan mahsulotlar
   */
  async getTopMahsulotlar(filter: string = 'kun') {
    const dateRange = this.getDateRange(filter);

    const saleItems = await this.db.prisma.saleItem.findMany({
      where: {
        sale: { createdAt: dateRange },
      },
      include: {
        product: true,
        sale: true,
      },
    });

    // Mahsulot bo'yicha guruhlash
    const mahsulotMap = new Map<
      string,
      {
        mahsulot: string;
        kategoriya: string;
        jamiKg: number;
        jamiSumma: number;
        jamiFoyda: number;
        sotuvlarSoni: number;
      }
    >();

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

    const topMahsulotlar = Array.from(mahsulotMap.values())
      .sort((a, b) => b.jamiSumma - a.jamiSumma)
      .slice(0, 10);

    return { filter, topMahsulotlar };
  }
}
