// // src/sale/sale.service.ts
// import {
//   Injectable,
//   NotFoundException,
//   BadRequestException,
// } from '@nestjs/common';
// import { PrismaService } from 'src/core/database/prisma.service';
// import { CreateSaleDto } from './dto/create-sale.dto';
// import { Prisma } from '@prisma/client';

// @Injectable()
// export class SaleService {
//   constructor(private readonly db: PrismaService) {}

//   // async create(dto: CreateSaleDto) {
//   //   return await this.db.prisma.$transaction(async (tx) => {
//   //     let total = new Prisma.Decimal(0);
//   //     const saleItems: any[] = [];

//   //     for (const item of dto.items) {
//   //       const product = await tx.product.findUnique({
//   //         where: { id: item.productId },
//   //       });

//   //       if (!product) {
//   //         throw new NotFoundException(`Mahsulot topilmadi: ${item.productId}`);
//   //       }

//   //       const quantity = new Prisma.Decimal(item.quantityKg);
//   //       const price = new Prisma.Decimal(product.sotish);

//   //       if (quantity.gt(product.stockKg)) {
//   //         throw new BadRequestException(
//   //           `${product.name} yetarli emas! Omborda: ${product.stockKg} kg`,
//   //         );
//   //       }

//   //       const subtotal = quantity.mul(price);
//   //       total = total.add(subtotal);

//   //       saleItems.push({
//   //         quantityKg: quantity,
//   //         pricePerKg: price,
//   //         costPerKg: new Prisma.Decimal(product.tannarx),
//   //         product: {
//   //           connect: { id: item.productId },
//   //         },
//   //       });

//   //       await tx.product.update({
//   //         where: { id: item.productId },
//   //         data: { stockKg: { decrement: quantity } },
//   //       });
//   //     }

//   //     // Savdo yaratish
//   //     const sale = await tx.sale.create({
//   //       data: {
//   //         totalAmount: total,
//   //         paymentMethod: dto.paymentMethod,
//   //         customerId: dto.paymentMethod === 'NASIYA' ? dto.customerId : null,
//   //         items: {
//   //           create: saleItems, // endi to'g'ri
//   //         },
//   //       },
//   //       include: {
//   //         items: {
//   //           include: { product: true },
//   //         },
//   //         customer: true,
//   //       },
//   //     });

//   //     if (dto.paymentMethod === 'NASIYA' && dto.customerId) {
//   //       await tx.customer.update({
//   //         where: { id: dto.customerId },
//   //         data: { totalDebt: { increment: total } },
//   //       });
//   //     }

//   //     return {
//   //       success: true,
//   //       message: 'Sotuv muvaffaqiyatli amalga oshirildi',
//   //       sale,
//   //       total: Number(total),
//   //     };
//   //   });
//   // }

//   async create(dto: CreateSaleDto) {
//     return await this.db.prisma.$transaction(async (tx) => {
//       let total = new Prisma.Decimal(0);
//       const saleItems: any[] = [];

//       for (const item of dto.items) {
//         const product = await tx.product.findUnique({
//           where: { id: item.productId },
//         });

//         if (!product) {
//           throw new NotFoundException(`Mahsulot topilmadi: ${item.productId}`);
//         }

//         const quantity = new Prisma.Decimal(item.quantityKg);
//         const price = new Prisma.Decimal(product.sotish);

//         if (quantity.gt(product.stockKg)) {
//           throw new BadRequestException(
//             `${product.name} yetarli emas! Omborda: ${product.stockKg} kg`,
//           );
//         }

//         total = total.add(quantity.mul(price));

//         saleItems.push({
//           quantityKg: quantity,
//           pricePerKg: price,
//           costPerKg: new Prisma.Decimal(product.tannarx),
//           product: { connect: { id: item.productId } },
//         });

//         await tx.product.update({
//           where: { id: item.productId },
//           data: { stockKg: { decrement: quantity } },
//         });
//       }

//       // ✅ NASIYA: customerId yo'q bo'lsa — customerName/Phone dan topib/yaratib olish
//       let resolvedCustomerId: string | null = null;

//       if (dto.paymentMethod === 'NASIYA') {
//         if (!dto.customerName) {
//           throw new BadRequestException('NASIYA uchun mijoz ismi kerak!');
//         }

//         // customerId bevosita kelgan bo'lsa — ishlatamiz
//         if (dto.customerId) {
//           resolvedCustomerId = dto.customerId;
//         } else {
//           // Telefon bo'yicha qidirish
//           let customer = null;
//           if (dto.customerPhone) {
//             customer = await tx.customer.findUnique({
//               where: { phone: dto.customerPhone },
//             });
//           }

//           // Topilmasa — yangi yaratish
//           if (!customer) {
//             customer = await tx.customer.create({
//               data: {
//                 name: dto.customerName,
//                 phone: dto.customerPhone || null,
//                 totalDebt: 0,
//               },
//             });
//           }

//           resolvedCustomerId = customer.id;
//         }
//       }

//       const sale = await tx.sale.create({
//         data: {
//           totalAmount: total,
//           paymentMethod: dto.paymentMethod,
//           customerId: resolvedCustomerId,
//           items: { create: saleItems },
//         },
//         include: {
//           items: { include: { product: true } },
//           customer: true,
//         },
//       });

//       // ✅ Mijoz qarzini yangilash + Nasiya yozuvi
//       if (dto.paymentMethod === 'NASIYA' && resolvedCustomerId) {
//         await tx.customer.update({
//           where: { id: resolvedCustomerId },
//           data: { totalDebt: { increment: total } },
//         });

//         await tx.nasiya.create({
//           data: {
//             customerId: resolvedCustomerId,
//             saleId: sale.id,
//             aslSumma: total,
//             qolganQarz: total,
//             izoh: dto.customerName + ' - sotuv',
//             status: 'ACTIVE',
//           },
//         });
//       }

//       return {
//         success: true,
//         message: 'Sotuv muvaffaqiyatli amalga oshirildi',
//         sale,
//         total: Number(total),
//       };
//     });
//   }
// }

////////

// src/sale/sale.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SaleService {
  constructor(private readonly db: PrismaService) {}

  async create(dto: CreateSaleDto) {
    return await this.db.prisma.$transaction(async (tx) => {
      let total = new Prisma.Decimal(0);
      const saleItems: any[] = [];

      // ── 1. Har bir item uchun stock tekshirish va ayirish ──
      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Mahsulot topilmadi: ${item.productId}`);
        }

        const quantity = new Prisma.Decimal(item.quantityKg);
        const price = new Prisma.Decimal(product.sotish);

        if (quantity.gt(product.stockKg)) {
          throw new BadRequestException(
            `${product.name} yetarli emas! Omborda: ${product.stockKg} kg`,
          );
        }

        total = total.add(quantity.mul(price));

        saleItems.push({
          quantityKg: quantity,
          pricePerKg: price,
          costPerKg: new Prisma.Decimal(product.tannarx),
          product: { connect: { id: item.productId } },
        });

        // ── STOCK AYIRISH ──
        await tx.product.update({
          where: { id: item.productId },
          data: { stockKg: { decrement: quantity } },
        });
      }

      // ── 2. NASIYA: mijozni topish yoki yaratish ──
      let resolvedCustomerId: string | null = null;

      if (dto.paymentMethod === 'NASIYA') {
        if (!dto.customerName) {
          throw new BadRequestException('NASIYA uchun mijoz ismi kerak!');
        }

        if (dto.customerId) {
          resolvedCustomerId = dto.customerId;
        } else {
          let customer: any = null;

          if (dto.customerPhone) {
            customer = await tx.customer.findUnique({
              where: { phone: dto.customerPhone },
            });
          }

          if (!customer) {
            customer = await tx.customer.create({
              data: {
                name: dto.customerName,
                phone: dto.customerPhone || null,
                totalDebt: 0,
              },
            });
          }

          resolvedCustomerId = customer.id;
        }
      }

      // ── 3. Savdo yaratish ──
      const sale = await tx.sale.create({
        data: {
          totalAmount: total,
          paymentMethod: dto.paymentMethod,
          customerId: resolvedCustomerId,
          items: { create: saleItems },
        },
        include: {
          items: { include: { product: true } },
          customer: true,
        },
      });

      // ── 4. NASIYA: mijoz qarzini yangilash + Nasiya yozuvi ──
      if (dto.paymentMethod === 'NASIYA' && resolvedCustomerId) {
        await tx.customer.update({
          where: { id: resolvedCustomerId },
          data: { totalDebt: { increment: total } },
        });

        await tx.nasiya.create({
          data: {
            customerId: resolvedCustomerId,
            saleId: sale.id,
            aslSumma: total,
            qolganQarz: total,
            izoh: `${dto.customerName} - sotuv`,
            status: 'ACTIVE',
          },
        });
      }

      return {
        success: true,
        message: 'Sotuv muvaffaqiyatli amalga oshirildi',
        sale,
        total: Number(total),
      };
    });
  }
}
