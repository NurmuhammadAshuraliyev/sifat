import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateNasiyaDto,
  UpdateNasiyaDto,
  QarzToMashDto,
} from './dto/nasiya.dto';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class NasiyaService {
  constructor(private db: PrismaService) {}

  /**
   * GET /nasiya - Barcha nasiya mijozlarni olish
   * Rasm 2 - NASIYALAR ro'yxati
   */
  async getAllNasiyalar(search?: string) {
    const customers = await this.db.prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
            ],
          }
        : undefined,
      include: {
        sales: {
          where: { paymentMethod: 'NASIYA' },
          include: { items: { include: { product: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { totalDebt: 'desc' },
    });

    const jamiQarz = customers.reduce((sum, c) => sum + Number(c.totalDebt), 0);

    return {
      jamiQarz,
      mijozlarSoni: customers.length,
      mijozlar: customers.map((c) => ({
        id: c.id,
        ism: c.name,
        telefon: c.phone,
        qarz: Number(c.totalDebt),
        yaratilgan: c.createdAt,
        yangilangan: c.updatedAt,
        sotuvlarSoni: c.sales.length,
      })),
    };
  }

  /**
   * GET /nasiya/:id - Bitta nasiya mijozni olish (barcha savdo tarixi bilan)
   */
  async getNasiyaById(id: string) {
    const customer = await this.db.prisma.customer.findUnique({
      where: { id },
      include: {
        sales: {
          include: {
            items: {
              include: { product: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Mijoz topilmadi: ${id}`);
    }

    const nasiyaSotuvlar = customer.sales.filter(
      (s) => s.paymentMethod === 'NASIYA',
    );
    const jamiNasiyaOlingan = nasiyaSotuvlar.reduce(
      (sum, s) => sum + Number(s.totalAmount),
      0,
    );

    return {
      id: customer.id,
      ism: customer.name,
      telefon: customer.phone,
      qolganQarz: Number(customer.totalDebt),
      jamiNasiyaOlingan,
      tomashQilingan: jamiNasiyaOlingan - Number(customer.totalDebt),
      yaratilgan: customer.createdAt,
      yangilangan: customer.updatedAt,
      sotuvTarixi: customer.sales.map((s) => ({
        id: s.id,
        summa: Number(s.totalAmount),
        tolovTuri: s.paymentMethod,
        sana: s.createdAt,
        mahsulotlar: s.items.map((item) => ({
          mahsulot: item.product.name,
          miqdor: Number(item.quantityKg),
          narx: Number(item.pricePerKg),
          jami: Number(item.quantityKg) * Number(item.pricePerKg),
        })),
      })),
    };
  }

  /**
   * POST /nasiya - Yangi nasiya (qarz) qo'shish
   * Mijoz mavjud bo'lsa qarzini oshiradi, yo'q bo'lsa yangi yaratadi
   */
  async createNasiya(dto: CreateNasiyaDto) {
    let customer = dto.telefon
      ? await this.db.prisma.customer.findFirst({
          where: { phone: dto.telefon },
        })
      : null;

    if (customer) {
      customer = await this.db.prisma.customer.update({
        where: { id: customer.id },
        data: {
          totalDebt: {
            increment: dto.qarzSumma,
          },
        },
      });
      return {
        muvaffaqiyat: true,
        xabar: "Mavjud mijozga qarz qo'shildi",
        mijoz: {
          id: customer.id,
          ism: customer.name,
          telefon: customer.phone,
          jamiQarz: Number(customer.totalDebt),
        },
      };
    } else {
      customer = await this.db.prisma.customer.create({
        data: {
          name: dto.mijozIsmi,
          phone: dto.telefon,
          totalDebt: dto.qarzSumma,
        },
      });
      return {
        muvaffaqiyat: true,
        xabar: 'Yangi mijoz va qarz yaratildi',
        mijoz: {
          id: customer.id,
          ism: customer.name,
          telefon: customer.phone,
          jamiQarz: Number(customer.totalDebt),
        },
      };
    }
  }

  /**
   * PATCH /nasiya/:id - Nasiya ma'lumotlarini yangilash
   */
  async updateNasiya(id: string, dto: UpdateNasiyaDto) {
    const mavjud = await this.db.prisma.customer.findUnique({ where: { id } });
    if (!mavjud) {
      throw new NotFoundException(`Mijoz topilmadi: ${id}`);
    }

    const yangilangan = await this.db.prisma.customer.update({
      where: { id },
      data: {
        ...(dto.mijozIsmi && { name: dto.mijozIsmi }),
        ...(dto.telefon !== undefined && { phone: dto.telefon }),
        ...(dto.totalDebt !== undefined && { totalDebt: dto.totalDebt }),
      },
    });

    return {
      muvaffaqiyat: true,
      xabar: "Mijoz ma'lumotlari yangilandi",
      mijoz: {
        id: yangilangan.id,
        ism: yangilangan.name,
        telefon: yangilangan.phone,
        qarz: Number(yangilangan.totalDebt),
      },
    };
  }

  /**
   * PATCH /nasiya/:id/tomash - Qarzni to'lash (qisman yoki to'liq)
   */
  async qarzToMash(id: string, dto: QarzToMashDto) {
    const customer = await this.db.prisma.customer.findUnique({
      where: { id },
    });
    if (!customer) {
      throw new NotFoundException(`Mijoz topilmadi: ${id}`);
    }

    if (dto.toMashSumma > Number(customer.totalDebt)) {
      throw new BadRequestException(
        `To'lash summasi qarzdan ko'p: qarz = ${customer.totalDebt} UZS`,
      );
    }

    const yangiQarz = Number(customer.totalDebt) - dto.toMashSumma;

    const yangilangan = await this.db.prisma.customer.update({
      where: { id },
      data: { totalDebt: yangiQarz },
    });

    return {
      muvaffaqiyat: true,
      xabar: `${dto.toMashSumma.toLocaleString()} UZS qarz to'landi`,
      toMashSumma: dto.toMashSumma,
      qolganQarz: Number(yangilangan.totalDebt),
      toMashTuliq: yangiQarz === 0,
    };
  }

  /**
   * DELETE /nasiya/:id - Nasiya mijozni o'chirish
   */
  async deleteNasiya(id: string) {
    const customer = await this.db.prisma.customer.findUnique({
      where: { id },
    });
    if (!customer) {
      throw new NotFoundException(`Mijoz topilmadi: ${id}`);
    }

    if (Number(customer.totalDebt) > 0) {
      throw new BadRequestException(
        `Mijozning ${customer.totalDebt} UZS qarzi bor. O'chirishdan oldin qarzni to'lang.`,
      );
    }

    await this.db.prisma.customer.delete({ where: { id } });

    return {
      muvaffaqiyat: true,
      xabar: `${customer.name} muvaffaqiyatli o'chirildi`,
    };
  }
}
