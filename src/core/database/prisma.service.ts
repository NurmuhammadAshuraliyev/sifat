// // src/core/database/prisma.service.ts
// import {
//   Injectable,
//   InternalServerErrorException,
//   Logger,
//   OnModuleDestroy,
//   OnModuleInit,
// } from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';
// import { PrismaPg } from '@prisma/adapter-pg';
// import { Pool } from 'pg';
// import dotenv from 'dotenv';

// dotenv.config();

// @Injectable()
// export class PrismaService implements OnModuleInit, OnModuleDestroy {
//   public readonly prisma: PrismaClient;
//   private readonly logger: Logger;
//   private readonly pool: Pool;

//   constructor() {
//     this.logger = new Logger(PrismaService.name);

//     this.prisma = new PrismaClient().$extends({
//       result: {
//         user: {
//           photeUrl: {
//             needs: {
//               photoUrl: true,
//             },
//             compute(imageData) {
//               if (!imageData.photoUrl) return null;

//               const url = process.env.AWS_CLOUDFRONT_URL;

//               const imageUrl = `${url}/${imageData.photoUrl}`;

//               return imageUrl;
//             },
//           },
//         },
//       },
//     }) as unknown as PrismaClient;

//     this.pool = new Pool({
//       connectionString: process.env.DATABASE_URL,
//       max: 10, // Maksimal ulanishlar soni
//       idleTimeoutMillis: 30000, // Bo'sh ulanishni qancha vaqt saqlash
//     });

//     // 2. Prisma 7 uchun Adapter
//     const adapter = new PrismaPg(this.pool);

//     // 3. PrismaClient ni adapter bilan yaratish (Bu eng muhim qism!)
//     this.prisma = new PrismaClient({
//       adapter,
//       // log: ['query', 'info', 'warn', 'error'], // Debugging uchun kerak bo'lsa oching
//     });
//   }

//   async onModuleInit() {
//     try {
//       await this.prisma.$connect();
//       this.logger.log('✅ Prisma 7 + PostgreSQL adapter muvaffaqiyatli ulandi');
//     } catch (error: any) {
//       this.logger.error('❌ Prisma ulanish xatosi:', error.message);
//       throw new InternalServerErrorException('Database connection failed');
//     }
//   }

//   async onModuleDestroy() {
//     try {
//       await this.prisma.$disconnect();
//       await this.pool.end(); // Pool ni toza yopish
//       this.logger.log('🔌 Prisma disconnected');
//     } catch (error: any) {
//       this.logger.error('Disconnect xatosi:', error.message);
//     }
//   }
// }

// src/core/database/prisma.service.ts
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public readonly prisma: PrismaClient;
  private readonly logger: Logger;
  private readonly pool: Pool;

  constructor() {
    this.logger = new Logger(PrismaService.name);

    // 1. PostgreSQL Pool
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
    });

    // 2. Prisma 7 Adapter
    const adapter = new PrismaPg(this.pool);

    // 3. PrismaClient + Adapter + Result Extension
    const baseClient = new PrismaClient({
      adapter,
    });

    this.prisma = baseClient.$extends({
      result: {
        user: {
          photoUrl: {
            needs: { photoUrl: true },
            compute: (user) => {
              if (!user.photoUrl) return null;
              const baseUrl = process.env.AWS_CLOUDFRONT_URL;

              return `${baseUrl}/${user.photoUrl}`;
            },
          },
        },
      },
    }) as unknown as PrismaClient; // ← Bu yer muhim tuzatish
  }

  async onModuleInit() {
    try {
      await this.prisma.$connect();
      this.logger.log('✅ Prisma 7 + PostgreSQL adapter muvaffaqiyatli ulandi');
    } catch (error: any) {
      this.logger.error('❌ Prisma ulanish xatosi:', error.message);
      throw new InternalServerErrorException('Database connection failed');
    }
  }

  async onModuleDestroy() {
    try {
      await this.prisma.$disconnect();
      await this.pool.end();
      this.logger.log('🔌 Prisma disconnected');
    } catch (error: any) {
      this.logger.error('Disconnect xatosi:', error.message);
    }
  }
}
