// import {
//   Injectable,
//   NotFoundException,
//   BadRequestException,
// } from '@nestjs/common';
// import {
//   CreateNasiyaDto,
//   UpdateNasiyaDto,
//   QarzToMashDto,
// } from './dto/nasiya.dto';
// import { PrismaService } from 'src/core/database/prisma.service';

// @Injectable()
// export class NasiyaService {
//   constructor(private db: PrismaService) {}

//   /**
//    * GET /nasiya - Barcha nasiya mijozlarni olish
//    * Rasm 2 - NASIYALAR ro'yxati
//    */
//   async getAllNasiyalar(search?: string) {
//     const customers = await this.db.prisma.customer.findMany({
//       where: search
//         ? {
//             OR: [
//               { name: { contains: search, mode: 'insensitive' } },
//               { phone: { contains: search } },
//             ],
//           }
//         : undefined,
//       include: {
//         sales: {
//           where: { paymentMethod: 'NASIYA' },
//           include: { items: { include: { product: true } } },
//           orderBy: { createdAt: 'desc' },
//         },
//       },
//       orderBy: { totalDebt: 'desc' },
//     });

//     const jamiQarz = customers.reduce((sum, c) => sum + Number(c.totalDebt), 0);

//     return {
//       jamiQarz,
//       mijozlarSoni: customers.length,
//       mijozlar: customers.map((c) => ({
//         id: c.id,
//         ism: c.name,
//         telefon: c.phone,
//         qarz: Number(c.totalDebt),
//         yaratilgan: c.createdAt,
//         yangilangan: c.updatedAt,
//         sotuvlarSoni: c.sales.length,
//       })),
//     };
//   }

//   /**
//    * GET /nasiya/:id - Bitta nasiya mijozni olish (barcha savdo tarixi bilan)
//    */
//   async getNasiyaById(id: string) {
//     const customer = await this.db.prisma.customer.findUnique({
//       where: { id },
//       include: {
//         sales: {
//           include: {
//             items: {
//               include: { product: true },
//             },
//           },
//           orderBy: { createdAt: 'desc' },
//         },
//       },
//     });

//     if (!customer) {
//       throw new NotFoundException(`Mijoz topilmadi: ${id}`);
//     }

//     const nasiyaSotuvlar = customer.sales.filter(
//       (s) => s.paymentMethod === 'NASIYA',
//     );
//     const jamiNasiyaOlingan = nasiyaSotuvlar.reduce(
//       (sum, s) => sum + Number(s.totalAmount),
//       0,
//     );

//     return {
//       id: customer.id,
//       ism: customer.name,
//       telefon: customer.phone,
//       qolganQarz: Number(customer.totalDebt),
//       jamiNasiyaOlingan,
//       tomashQilingan: jamiNasiyaOlingan - Number(customer.totalDebt),
//       yaratilgan: customer.createdAt,
//       yangilangan: customer.updatedAt,
//       sotuvTarixi: customer.sales.map((s) => ({
//         id: s.id,
//         summa: Number(s.totalAmount),
//         tolovTuri: s.paymentMethod,
//         sana: s.createdAt,
//         mahsulotlar: s.items.map((item) => ({
//           mahsulot: item.product.name,
//           miqdor: Number(item.quantityKg),
//           narx: Number(item.pricePerKg),
//           jami: Number(item.quantityKg) * Number(item.pricePerKg),
//         })),
//       })),
//     };
//   }

//   /**
//    * POST /nasiya - Yangi nasiya (qarz) qo'shish
//    * Mijoz mavjud bo'lsa qarzini oshiradi, yo'q bo'lsa yangi yaratadi
//    */
//   async createNasiya(dto: CreateNasiyaDto) {
//     let customer = dto.telefon
//       ? await this.db.prisma.customer.findFirst({
//           where: { phone: dto.telefon },
//         })
//       : null;

//     if (customer) {
//       customer = await this.db.prisma.customer.update({
//         where: { id: customer.id },
//         data: {
//           totalDebt: {
//             increment: dto.qarzSumma,
//           },
//         },
//       });
//       return {
//         muvaffaqiyat: true,
//         xabar: "Mavjud mijozga qarz qo'shildi",
//         mijoz: {
//           id: customer.id,
//           ism: customer.name,
//           telefon: customer.phone,
//           jamiQarz: Number(customer.totalDebt),
//         },
//       };
//     } else {
//       customer = await this.db.prisma.customer.create({
//         data: {
//           name: dto.mijozIsmi,
//           phone: dto.telefon,
//           totalDebt: dto.qarzSumma,
//         },
//       });
//       return {
//         muvaffaqiyat: true,
//         xabar: 'Yangi mijoz va qarz yaratildi',
//         mijoz: {
//           id: customer.id,
//           ism: customer.name,
//           telefon: customer.phone,
//           jamiQarz: Number(customer.totalDebt),
//         },
//       };
//     }
//   }

//   /**
//    * PATCH /nasiya/:id - Nasiya ma'lumotlarini yangilash
//    */
//   async updateNasiya(id: string, dto: UpdateNasiyaDto) {
//     const mavjud = await this.db.prisma.customer.findUnique({ where: { id } });
//     if (!mavjud) {
//       throw new NotFoundException(`Mijoz topilmadi: ${id}`);
//     }

//     const yangilangan = await this.db.prisma.customer.update({
//       where: { id },
//       data: {
//         ...(dto.mijozIsmi && { name: dto.mijozIsmi }),
//         ...(dto.telefon !== undefined && { phone: dto.telefon }),
//         ...(dto.totalDebt !== undefined && { totalDebt: dto.totalDebt }),
//       },
//     });

//     return {
//       muvaffaqiyat: true,
//       xabar: "Mijoz ma'lumotlari yangilandi",
//       mijoz: {
//         id: yangilangan.id,
//         ism: yangilangan.name,
//         telefon: yangilangan.phone,
//         qarz: Number(yangilangan.totalDebt),
//       },
//     };
//   }

//   /**
//    * PATCH /nasiya/:id/tomash - Qarzni to'lash (qisman yoki to'liq)
//    */
//   async qarzToMash(id: string, dto: QarzToMashDto) {
//     const customer = await this.db.prisma.customer.findUnique({
//       where: { id },
//     });
//     if (!customer) {
//       throw new NotFoundException(`Mijoz topilmadi: ${id}`);
//     }

//     if (dto.toMashSumma > Number(customer.totalDebt)) {
//       throw new BadRequestException(
//         `To'lash summasi qarzdan ko'p: qarz = ${customer.totalDebt} UZS`,
//       );
//     }

//     const yangiQarz = Number(customer.totalDebt) - dto.toMashSumma;

//     const yangilangan = await this.db.prisma.customer.update({
//       where: { id },
//       data: { totalDebt: yangiQarz },
//     });

//     return {
//       muvaffaqiyat: true,
//       xabar: `${dto.toMashSumma.toLocaleString()} UZS qarz to'landi`,
//       toMashSumma: dto.toMashSumma,
//       qolganQarz: Number(yangilangan.totalDebt),
//       toMashTuliq: yangiQarz === 0,
//     };
//   }

//   /**
//    * DELETE /nasiya/:id - Nasiya mijozni o'chirish
//    */
//   async deleteNasiya(id: string) {
//     const customer = await this.db.prisma.customer.findUnique({
//       where: { id },
//     });
//     if (!customer) {
//       throw new NotFoundException(`Mijoz topilmadi: ${id}`);
//     }

//     if (Number(customer.totalDebt) > 0) {
//       throw new BadRequestException(
//         `Mijozning ${customer.totalDebt} UZS qarzi bor. O'chirishdan oldin qarzni to'lang.`,
//       );
//     }

//     await this.db.prisma.customer.delete({ where: { id } });

//     return {
//       muvaffaqiyat: true,
//       xabar: `${customer.name} muvaffaqiyatli o'chirildi`,
//     };
//   }
// }

////////

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateNasiyaDto,
  CreateMijozVaNasiyaDto,
  UpdateNasiyaDto,
  QarzTolovDto,
  CreateCustomerDto,
  UpdateCustomerDto,
} from './dto/nasiya.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { NasiyaStatus } from '@prisma/client';

@Injectable()
export class NasiyaService {
  constructor(private db: PrismaService) {}

  // ─────────────────────────────────────────────
  // CUSTOMER (MIJOZ) OPERATSIYALARI
  // ─────────────────────────────────────────────

  /**
   * GET /nasiya/customers
   * Barcha mijozlar + ularning jami qarzlari
   */
  async getAllCustomers(search?: string) {
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
        nasiyalar: {
          where: { status: NasiyaStatus.ACTIVE },
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
        totalDebt: Number(c.totalDebt),
        faolNasiyalarSoni: c.nasiyalar.length,
        yaratilgan: c.createdAt,
        yangilangan: c.updatedAt,
      })),
    };
  }

  /**
   * POST /nasiya/customers
   * Yangi mijoz yaratish (qarsiz)
   */
  async createCustomer(dto: CreateCustomerDto) {
    if (dto.telefon) {
      const mavjud = await this.db.prisma.customer.findFirst({
        where: { phone: dto.telefon },
      });
      if (mavjud) {
        throw new BadRequestException(
          `Bu telefon raqam allaqachon ro'yxatdan o'tgan: ${dto.telefon}`,
        );
      }
    }

    const customer = await this.db.prisma.customer.create({
      data: { name: dto.name, phone: dto.telefon },
    });

    return {
      muvaffaqiyat: true,
      xabar: 'Yangi mijoz yaratildi',
      mijoz: customer,
    };
  }

  /**
   * PATCH /nasiya/customers/:id
   * Mijoz ma'lumotlarini yangilash
   */
  async updateCustomer(id: string, dto: UpdateCustomerDto) {
    await this.findCustomerOrThrow(id);

    const yangilangan = await this.db.prisma.customer.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.telefon !== undefined && { phone: dto.telefon }),
      },
    });

    return {
      muvaffaqiyat: true,
      xabar: "Mijoz ma'lumotlari yangilandi",
      mijoz: yangilangan,
    };
  }

  /**
   * DELETE /nasiya/customers/:id
   * Mijozni o'chirish — faqat barcha qarzlar yopilgan bo'lsa
   */
  async deleteCustomer(id: string) {
    const customer = await this.findCustomerOrThrow(id);

    if (Number(customer.totalDebt) > 0) {
      throw new BadRequestException(
        `Mijozning ${customer.totalDebt} UZS qarzi bor. Avval qarzlarni yoping.`,
      );
    }

    await this.db.prisma.customer.delete({ where: { id } });

    return {
      muvaffaqiyat: true,
      xabar: `${customer.name} muvaffaqiyatli o'chirildi`,
    };
  }

  // ─────────────────────────────────────────────
  // NASIYA OPERATSIYALARI
  // ─────────────────────────────────────────────

  /**
   * GET /nasiya
   * Barcha nasiyalar (filter: active/closed/all)
   */
  async getAllNasiyalar(search?: string, status?: 'active' | 'closed' | 'all') {
    const statusFilter =
      status === 'all'
        ? undefined
        : status === 'closed'
          ? NasiyaStatus.CLOSED
          : NasiyaStatus.ACTIVE; // default: faqat faol

    const nasiyalar = await this.db.prisma.nasiya.findMany({
      where: {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(search
          ? {
              customer: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { phone: { contains: search } },
                ],
              },
            }
          : {}),
      },
      include: {
        customer: true,
        tolovlar: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const jamiQarz = nasiyalar.reduce(
      (sum, n) => sum + Number(n.qolganQarz),
      0,
    );
    const jamiAslSumma = nasiyalar.reduce(
      (sum, n) => sum + Number(n.aslSumma),
      0,
    );

    return {
      jamiQarz,
      jamiAslSumma,
      nasiyalarSoni: nasiyalar.length,
      nasiyalar: nasiyalar.map((n) => this.formatNasiya(n)),
    };
  }

  /**
   * GET /nasiya/:id
   * Bitta nasiyaning to'liq ma'lumoti (to'lov tarixi bilan)
   */
  async getNasiyaById(id: string) {
    const nasiya = await this.db.prisma.nasiya.findUnique({
      where: { id },
      include: {
        customer: true,
        tolovlar: { orderBy: { createdAt: 'desc' } },
        sales: { include: { items: { include: { product: true } } } },
      },
    });

    if (!nasiya) throw new NotFoundException(`Nasiya topilmadi: ${id}`);

    const jamiTolangan = nasiya.tolovlar.reduce(
      (sum, t) => sum + Number(t.summa),
      0,
    );

    return {
      ...this.formatNasiya(nasiya),
      jamiTolangan,
      tolovTarixi: nasiya.tolovlar.map((t) => ({
        id: t.id,
        summa: Number(t.summa),
        izoh: t.izoh,
        sana: t.createdAt,
      })),
      bogMahsulotlar: nasiya.sales.flatMap((s) =>
        s.items.map((item) => ({
          mahsulot: item.product.name,
          miqdorKg: Number(item.quantityKg),
          narx: Number(item.pricePerKg),
          jami: Number(item.quantityKg) * Number(item.pricePerKg),
        })),
      ),
    };
  }

  /**
   * GET /nasiya/customer/:customerId
   * Bitta mijozning barcha nasiyalari
   */
  async getNasiyalarByCustomer(customerId: string) {
    const customer = await this.findCustomerOrThrow(customerId);

    const nasiyalar = await this.db.prisma.nasiya.findMany({
      where: { customerId },
      include: {
        tolovlar: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      mijoz: {
        id: customer.id,
        ism: customer.name,
        telefon: customer.phone,
        totalDebt: Number(customer.totalDebt),
      },
      nasiyalarSoni: nasiyalar.length,
      faolNasiyalar: nasiyalar.filter((n) => n.status === NasiyaStatus.ACTIVE)
        .length,
      nasiyalar: nasiyalar.map((n) => this.formatNasiya(n)),
    };
  }

  /**
   * POST /nasiya
   * Mavjud mijozga yangi qarz ochish
   */
  async createNasiya(dto: CreateNasiyaDto) {
    const customer = await this.findCustomerOrThrow(dto.customerId);

    const nasiya = await this.db.prisma.$transaction(async (tx) => {
      // 1. Yangi nasiya yozuvi yaratish
      const yangiNasiya = await tx.nasiya.create({
        data: {
          customerId: dto.customerId,
          saleId: dto.saleId,
          aslSumma: dto.aslSumma,
          qolganQarz: dto.aslSumma, // Dastlab qolgan qarz = asl summa
          izoh: dto.izoh,
          status: NasiyaStatus.ACTIVE,
        },
        include: { customer: true },
      });

      // 2. Customer.totalDebt ni oshirish
      await tx.customer.update({
        where: { id: dto.customerId },
        data: { totalDebt: { increment: dto.aslSumma } },
      });

      return yangiNasiya;
    });

    return {
      muvaffaqiyat: true,
      xabar: `${customer.name} uchun yangi qarz ochildi`,
      nasiya: this.formatNasiya(nasiya),
    };
  }

  /**
   * POST /nasiya/mijoz
   * Yangi mijoz yaratish + darhol qarz ochish (bitta so'rov bilan)
   */
  async createMijozVaNasiya(dto: CreateMijozVaNasiyaDto) {
    // Telefon mavjudligini tekshirish
    if (dto.telefon) {
      const mavjud = await this.db.prisma.customer.findFirst({
        where: { phone: dto.telefon },
      });
      if (mavjud) {
        throw new BadRequestException(
          `Bu telefon raqam allaqachon ro'yxatdan o'tgan. Mavjud mijozga qarz qo'shish uchun POST /nasiya endpointidan foydalaning.`,
        );
      }
    }

    const { customer, nasiya } = await this.db.prisma.$transaction(
      async (tx) => {
        // 1. Yangi mijoz yaratish
        const yangiCustomer = await tx.customer.create({
          data: {
            name: dto.mijozIsmi,
            phone: dto.telefon,
            totalDebt: dto.aslSumma,
          },
        });

        // 2. Nasiya yaratish
        const yangiNasiya = await tx.nasiya.create({
          data: {
            customerId: yangiCustomer.id,
            aslSumma: dto.aslSumma,
            qolganQarz: dto.aslSumma,
            izoh: dto.izoh,
            status: NasiyaStatus.ACTIVE,
          },
        });

        return { customer: yangiCustomer, nasiya: yangiNasiya };
      },
    );

    return {
      muvaffaqiyat: true,
      xabar: 'Yangi mijoz va qarz muvaffaqiyatli yaratildi',
      mijoz: { id: customer.id, ism: customer.name, telefon: customer.phone },
      nasiya: {
        id: nasiya.id,
        aslSumma: Number(nasiya.aslSumma),
        qolganQarz: Number(nasiya.qolganQarz),
        status: nasiya.status,
      },
    };
  }

  /**
   * PATCH /nasiya/:id
   * Nasiya izohini yangilash
   */
  async updateNasiya(id: string, dto: UpdateNasiyaDto) {
    await this.findNasiyaOrThrow(id);

    const yangilangan = await this.db.prisma.nasiya.update({
      where: { id },
      data: { izoh: dto.izoh },
      include: { customer: true },
    });

    return {
      muvaffaqiyat: true,
      xabar: 'Nasiya yangilandi',
      nasiya: this.formatNasiya(yangilangan),
    };
  }

  /**
   * POST /nasiya/:id/tolov
   * Qarzni to'lash — qisman yoki to'liq
   * To'lov tarixi NasiyaTolov jadvalida saqlanadi
   */
  async qarzTolov(id: string, dto: QarzTolovDto) {
    const nasiya = await this.findNasiyaOrThrow(id);

    if (nasiya.status === NasiyaStatus.CLOSED) {
      throw new BadRequestException('Bu nasiya allaqachon yopilgan');
    }

    if (dto.summa > Number(nasiya.qolganQarz)) {
      throw new BadRequestException(
        `To'lash summasi qarzdan ko'p. Qolgan qarz: ${nasiya.qolganQarz} UZS`,
      );
    }

    const yangiQolganQarz = Number(nasiya.qolganQarz) - dto.summa;
    const toMashTuliq = yangiQolganQarz === 0;

    const { yangilangan, tolov } = await this.db.prisma.$transaction(
      async (tx) => {
        // 1. NasiyaTolov yozuvi yaratish
        const yangiTolov = await tx.nasiyaTolov.create({
          data: {
            nasiyaId: id,
            summa: dto.summa,
            izoh: dto.izoh,
          },
        });

        // 2. Nasiya qolganQarz va status yangilash
        const yangilananNasiya = await tx.nasiya.update({
          where: { id },
          data: {
            qolganQarz: yangiQolganQarz,
            status: toMashTuliq ? NasiyaStatus.CLOSED : NasiyaStatus.ACTIVE,
          },
          include: { customer: true },
        });

        // 3. Customer.totalDebt ni kamaytirish
        await tx.customer.update({
          where: { id: nasiya.customerId },
          data: { totalDebt: { decrement: dto.summa } },
        });

        return { yangilangan: yangilananNasiya, tolov: yangiTolov };
      },
    );

    return {
      muvaffaqiyat: true,
      xabar: toMashTuliq
        ? `Qarz to'liq to'landi! Nasiya yopildi.`
        : `${dto.summa.toLocaleString()} UZS to'landi`,
      toMashSumma: dto.summa,
      qolganQarz: yangiQolganQarz,
      toMashTuliq,
      tolov: {
        id: tolov.id,
        summa: Number(tolov.summa),
        sana: tolov.createdAt,
      },
      nasiya: this.formatNasiya(yangilangan),
    };
  }

  /**
   * DELETE /nasiya/:id
   * Nasiyani o'chirish — faqat CLOSED bo'lsa yoki admin
   */
  async deleteNasiya(id: string) {
    const nasiya = await this.findNasiyaOrThrow(id);

    if (
      nasiya.status === NasiyaStatus.ACTIVE &&
      Number(nasiya.qolganQarz) > 0
    ) {
      throw new BadRequestException(
        `Nasiyada ${nasiya.qolganQarz} UZS qarz bor. Avval qarzni to'lang.`,
      );
    }

    // Agar Active lekin qolganQarz = 0 (edge case), Customer.totalDebt tuzatish
    await this.db.prisma.$transaction(async (tx) => {
      if (Number(nasiya.qolganQarz) > 0) {
        await tx.customer.update({
          where: { id: nasiya.customerId },
          data: { totalDebt: { decrement: Number(nasiya.qolganQarz) } },
        });
      }
      await tx.nasiya.delete({ where: { id } });
    });

    return {
      muvaffaqiyat: true,
      xabar: "Nasiya o'chirildi",
    };
  }

  // ─────────────────────────────────────────────
  // YORDAMCHI METODLAR
  // ─────────────────────────────────────────────

  private async findCustomerOrThrow(id: string) {
    const customer = await this.db.prisma.customer.findUnique({
      where: { id },
    });
    if (!customer) throw new NotFoundException(`Mijoz topilmadi: ${id}`);
    return customer;
  }

  private async findNasiyaOrThrow(id: string) {
    const nasiya = await this.db.prisma.nasiya.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!nasiya) throw new NotFoundException(`Nasiya topilmadi: ${id}`);
    return nasiya;
  }

  private formatNasiya(nasiya: any) {
    const jamiTolangan = Number(nasiya.aslSumma) - Number(nasiya.qolganQarz);

    return {
      id: nasiya.id,
      mijoz: nasiya.customer
        ? {
            id: nasiya.customer.id,
            ism: nasiya.customer.name,
            telefon: nasiya.customer.phone,
          }
        : undefined,
      aslSumma: Number(nasiya.aslSumma),
      qolganQarz: Number(nasiya.qolganQarz),
      jamiTolangan,
      foiz:
        nasiya.aslSumma > 0
          ? Math.round((jamiTolangan / Number(nasiya.aslSumma)) * 100)
          : 0,
      izoh: nasiya.izoh,
      status: nasiya.status,
      tolovlarSoni: nasiya.tolovlar?.length ?? 0,
      yaratilgan: nasiya.createdAt,
      yangilangan: nasiya.updatedAt,
    };
  }
}
