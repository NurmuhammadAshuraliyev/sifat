// import { Injectable, Logger } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
// import { PrismaClient } from '@prisma/client';
// import fs from 'fs';
// import path from 'path';

// // npm install node-telegram-bot-api
// // npm install @nestjs/schedule
// // npm install -D @types/node-telegram-bot-api

// const TelegramBot = require('node-telegram-bot-api');

// @Injectable()
// export class BackupService {
//   private readonly logger = new Logger(BackupService.name);
//   private readonly prisma = new PrismaClient();
//   private readonly bot: any;
//   private readonly chatId: string;
//   private readonly backupDir = path.join(process.cwd(), 'backups');

//   constructor() {
//     const token = process.env.TELEGRAM_BOT_TOKEN;
//     this.chatId = process.env.TELEGRAM_CHAT_ID || '';

//     if (!token) {
//       this.logger.warn(
//         'TELEGRAM_BOT_TOKEN .env da topilmadi! Telegram backup ishlalmaydi.',
//       );
//     } else {
//       this.bot = new TelegramBot(token);
//     }

//     // Backup papkasini yaratish
//     if (!fs.existsSync(this.backupDir)) {
//       fs.mkdirSync(this.backupDir, { recursive: true });
//     }
//   }

//   // Har 5 soatda ishlaydigan Cron Job
//   // '0 */5 * * *'  →  soat 0, 5, 10, 15, 20 da
//   @Cron('0 */5 * * *')
//   async runBackup() {
//     this.logger.log('=== Backup boshlandi ===');
//     try {
//       const backupData = await this.collectAllData();
//       const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//       const filename = `backup_${timestamp}.json`;

//       // 1. Mahalliy faylga saqlash
//       await this.saveToFile(backupData, filename);

//       // 2. Telegram ga yuborish
//       await this.sendToTelegram(backupData, filename);

//       // 3. Eski backuplarni tozalash (3 oydan ko'pini o'chirish)
//       await this.cleanOldBackups();

//       this.logger.log(`=== Backup muvaffaqiyatli yakunlandi: ${filename} ===`);
//     } catch (error) {
//       this.logger.error('Backup xatosi:', error);
//       await this.sendErrorToTelegram(error);
//     }
//   }

//   // Ilovani ishga tushirganda darhol bir marta backup qilish
//   async onApplicationBootstrap() {
//     this.logger.log('Server ishga tushdi → birinchi backup tekshirilmoqda...');
//     // 30 soniya kutib, loyha to'liq yuklansin
//     setTimeout(() => this.runBackup(), 30_000);
//   }

//   private async collectAllData(): Promise<object> {
//     const [
//       users,
//       products,
//       customers,
//       nasiyalar,
//       nasiyaTolovlar,
//       sales,
//       saleItems,
//       transactions,
//     ] = await Promise.all([
//       this.prisma.user.findMany(),
//       this.prisma.product.findMany(),
//       this.prisma.customer.findMany(),
//       this.prisma.nasiya.findMany(),
//       this.prisma.nasiyaTolov.findMany(),
//       this.prisma.sale.findMany(),
//       this.prisma.saleItem.findMany(),
//       this.prisma.transaction.findMany(),
//     ]);

//     return {
//       meta: {
//         backupDate: new Date().toISOString(),
//         counts: {
//           users: users.length,
//           products: products.length,
//           customers: customers.length,
//           nasiyalar: nasiyalar.length,
//           nasiyaTolovlar: nasiyaTolovlar.length,
//           sales: sales.length,
//           saleItems: saleItems.length,
//           transactions: transactions.length,
//         },
//       },
//       data: {
//         users,
//         products,
//         customers,
//         nasiyalar,
//         nasiyaTolovlar,
//         sales,
//         saleItems,
//         transactions,
//       },
//     };
//   }

//   private async saveToFile(data: object, filename: string): Promise<string> {
//     const filePath = path.join(this.backupDir, filename);
//     fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
//     this.logger.log(`Fayl saqlandi: ${filePath}`);
//     return filePath;
//   }

//   private async sendToTelegram(data: any, filename: string): Promise<void> {
//     if (!this.bot || !this.chatId) {
//       this.logger.warn("Telegram sozlanmagan, o'tkazib yuborildi");
//       return;
//     }

//     const meta = data.meta;
//     const counts = meta.counts;

//     // Xabar matni
//     const message =
//       `📦 *Avtomatik Backup*\n` +
//       `🗓 ${new Date().toLocaleString('uz-UZ')}\n\n` +
//       `📊 *Jadvallar:*\n` +
//       `👤 Foydalanuvchilar: ${counts.users}\n` +
//       `📦 Mahsulotlar: ${counts.products}\n` +
//       `🧑 Mijozlar: ${counts.customers}\n` +
//       `💳 Nasiyalar: ${counts.nasiyalar}\n` +
//       `💰 To'lovlar: ${counts.nasiyaTolovlar}\n` +
//       `🛒 Sotuvlar: ${counts.sales}\n` +
//       `📋 Sotuv elementlari: ${counts.saleItems}\n` +
//       `📈 Tranzaksiyalar: ${counts.transactions}\n`;

//     // Matn xabari yuborish
//     await this.bot.sendMessage(this.chatId, message, {
//       parse_mode: 'Markdown',
//     });

//     // JSON faylni yuborish
//     const filePath = path.join(this.backupDir, filename);
//     await this.bot.sendDocument(this.chatId, filePath, {
//       caption: `✅ Backup fayli: ${filename}`,
//     });

//     this.logger.log('Telegram ga yuborildi');
//   }

//   private async sendErrorToTelegram(error: any): Promise<void> {
//     if (!this.bot || !this.chatId) return;
//     try {
//       await this.bot.sendMessage(
//         this.chatId,
//         `❌ *Backup xatosi!*\n\`\`\`${String(error?.message || error)}\`\`\``,
//         { parse_mode: 'Markdown' },
//       );
//     } catch (e) {
//       this.logger.error('Xato xabarini yuborishda muammo:', e);
//     }
//   }

//   private async cleanOldBackups(): Promise<void> {
//     const threeMonthsAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
//     const files = fs.readdirSync(this.backupDir);

//     for (const file of files) {
//       const filePath = path.join(this.backupDir, file);
//       const stat = fs.statSync(filePath);
//       if (stat.mtimeMs < threeMonthsAgo) {
//         fs.unlinkSync(filePath);
//         this.logger.log(`Eski backup o'chirildi: ${file}`);
//       }
//     }
//   }

//   // Manual backup trigger qilish uchun (API endpoint dan chaqirish mumkin)
//   async triggerManualBackup(): Promise<{ message: string }> {
//     await this.runBackup();
//     return { message: 'Manual backup muvaffaqiyatli yakunlandi' };
//   }
// }

import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import fs from 'fs';
import path from 'path';
import { PrismaService } from 'src/core/database/prisma.service';

const TelegramBot = require('node-telegram-bot-api');

@Injectable()
export class BackupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BackupService.name);
  private readonly bot: any;
  private readonly chatId: string;
  private readonly backupDir = path.join(process.cwd(), 'backups');

  // PrismaService loyhadagi mavjud instance ni inject qilamiz
  constructor(private readonly db: PrismaService) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = process.env.TELEGRAM_CHAT_ID || '';

    if (!token) {
      this.logger.warn(
        'TELEGRAM_BOT_TOKEN topilmadi — Telegram backup ishlarmaydi',
      );
    } else {
      this.bot = new TelegramBot(token);
    }

    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // Server yoqilganda 30 soniya keyin birinchi backupni ishga tushiradi
  onApplicationBootstrap() {
    setTimeout(() => {
      this.logger.log('Server tayyor → birinchi backup boshlanmoqda...');
      this.runBackup();
    }, 30_000);
  }
  private isRunning = false;
  // Har 5 soatda: soat 0, 5, 10, 15, 20 da
  @Cron('0 */5 * * *')
  async runBackup() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.logger.log('=== Backup boshlandi ===');
    try {
      // Avval DB ga ulanishni tekshiramiz
      await this.db.prisma.$queryRaw`SELECT 1`;

      const backupData = await this.collectAllData();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup_${timestamp}.json`;

      await this.saveToFile(backupData, filename);
      await this.sendToTelegram(backupData, filename);
      await this.cleanOldBackups();

      this.logger.log(`=== Backup yakunlandi: ${filename} ===`);
    } catch (error: any) {
      this.isRunning = false;
      this.logger.error('Backup xatosi:', error?.message || error);
      await this.sendErrorToTelegram(error);
    }
  }

  private async collectAllData(): Promise<object> {
    // const [
    //   users,
    //   products,
    //   customers,
    //   nasiyalar,
    //   nasiyaTolovlar,
    //   sales,
    //   saleItems,
    //   transactions,
    // ] = await Promise.all([
    //   this.db.prisma.product.findMany(),
    //   this.db.prisma.customer.findMany(),
    //   this.db.prisma.nasiya.findMany(),
    //   this.db.prisma.nasiyaTolov.findMany(),
    //   this.db.prisma.sale.findMany(),
    //   this.db.prisma.saleItem.findMany(),
    //   this.db.prisma.user.findMany(),
    //   this.db.prisma.transaction.findMany(),
    // ]);

    const [
      users,
      products,
      customers,
      nasiyalar,
      nasiyaTolovlar,
      sales,
      saleItems,
      transactions,
    ] = await Promise.all([
      this.db.prisma.user.findMany(),
      this.db.prisma.product.findMany(),
      this.db.prisma.customer.findMany(),
      this.db.prisma.nasiya.findMany(),
      this.db.prisma.nasiyaTolov.findMany(),
      this.db.prisma.sale.findMany(),
      this.db.prisma.saleItem.findMany(),
      this.db.prisma.transaction.findMany(),
    ]);

    return {
      meta: {
        backupDate: new Date().toISOString(),
        counts: {
          users: users.length,
          products: products.length,
          customers: customers.length,
          nasiyalar: nasiyalar.length,
          nasiyaTolovlar: nasiyaTolovlar.length,
          sales: sales.length,
          saleItems: saleItems.length,
          transactions: transactions.length,
        },
      },
      data: {
        users,
        products,
        customers,
        nasiyalar,
        nasiyaTolovlar,
        sales,
        saleItems,
        transactions,
      },
    };
  }

  private saveToFile(data: object, filename: string): void {
    const filePath = path.join(this.backupDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    this.logger.log(`Fayl saqlandi: ${filePath}`);
  }

  private async sendToTelegram(data: any, filename: string): Promise<void> {
    if (!this.bot || !this.chatId) {
      this.logger.warn("Telegram sozlanmagan, o'tkazib yuborildi");
      return;
    }

    const { counts } = data.meta;
    const message =
      `📦 *Avtomatik Backup*\n` +
      `🗓 ${new Date().toLocaleString('uz-UZ')}\n\n` +
      `📊 *Jadvallar:*\n` +
      `👤 Foydalanuvchilar: ${counts.users}\n` +
      `📦 Mahsulotlar: ${counts.products}\n` +
      `🧑 Mijozlar: ${counts.customers}\n` +
      `💳 Nasiyalar: ${counts.nasiyalar}\n` +
      `💰 To'lovlar: ${counts.nasiyaTolovlar}\n` +
      `🛒 Sotuvlar: ${counts.sales}\n` +
      `📋 Sotuv elementlari: ${counts.saleItems}\n` +
      `📈 Tranzaksiyalar: ${counts.transactions}`;

    await this.bot.sendMessage(this.chatId, message, {
      parse_mode: 'Markdown',
    });

    const filePath = path.join(this.backupDir, filename);
    // await this.bot.sendDocument(this.chatId, filePath, {
    //   caption: `✅ ${filename}`,
    // });

    await this.bot.sendDocument(this.chatId, fs.createReadStream(filePath), {
      caption: `✅ ${filename}`,
      contentType: 'application/json',
    });

    this.logger.log('Telegram ga yuborildi ✓');
  }

  private async sendErrorToTelegram(error: any): Promise<void> {
    if (!this.bot || !this.chatId) return;
    try {
      await this.bot.sendMessage(
        this.chatId,
        `❌ *Backup xatosi!*\n\`\`\`\n${String(error?.message || error).slice(0, 500)}\n\`\`\``,
        { parse_mode: 'Markdown' },
      );
    } catch (_) {}
  }

  private cleanOldBackups(): void {
    const threeMonthsAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const files = fs.readdirSync(this.backupDir);
    for (const file of files) {
      const filePath = path.join(this.backupDir, file);
      const stat = fs.statSync(filePath);
      if (stat.mtimeMs < threeMonthsAgo) {
        fs.unlinkSync(filePath);
        this.logger.log(`Eski backup o'chirildi: ${file}`);
      }
    }
  }

  // Manual trigger uchun
  async triggerManualBackup(): Promise<{ message: string }> {
    await this.runBackup();
    return { message: 'Manual backup muvaffaqiyatli yakunlandi' };
  }
}

////////////////////

// import { Injectable, Logger } from '@nestjs/common';
// import { PrismaService } from 'src/core/database/prisma.service';
// import { exec } from 'child_process';
// import fs from 'fs';
// import path from 'path';
// import crypto from 'crypto';
// import zlib from 'zlib';
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// @Injectable()
// export class BackupService {
//   private readonly logger = new Logger(BackupService.name);
//   private backupDir = path.join(process.cwd(), 'backups');

//   private s3 = new S3Client({
//     region: 'auto',
//     endpoint: process.env.R2_ENDPOINT,
//     credentials: {
//       accessKeyId: process.env.R2_KEY!,
//       secretAccessKey: process.env.R2_SECRET!,
//     },
//   });

//   constructor(private readonly db: PrismaService) {}

//   // 🚀 MAIN BACKUP
//   async runBackup() {
//     this.logger.log('🚀 Backup started');

//     const rawFile = await this.createPgDump();
//     const compressed = await this.compress(rawFile);
//     const encrypted = await this.encrypt(compressed);

//     const filename = path.basename(encrypted);

//     await this.uploadToR2(encrypted, filename);
//     await this.saveMeta(filename);

//     this.cleanup([rawFile, compressed, encrypted]);

//     this.logger.log('✅ Backup finished');
//   }

//   // 🧨 1. PG DUMP
//   private createPgDump(): Promise<string> {
//     const file = path.join(this.backupDir, `db_${Date.now()}.sql`);

//     return new Promise((resolve, reject) => {
//       exec(`pg_dump ${process.env.DATABASE_URL} > ${file}`, (err) => {
//         if (err) return reject(err);
//         resolve(file);
//       });
//     });
//   }

//   // 🗜 2. COMPRESS
//   private compress(file: string): Promise<string> {
//     return new Promise((resolve, reject) => {
//       const gzFile = `${file}.gz`;

//       const input = fs.createReadStream(file);
//       const output = fs.createWriteStream(gzFile);
//       const gzip = zlib.createGzip();

//       input.pipe(gzip).pipe(output);

//       output.on('finish', () => resolve(gzFile));
//       output.on('error', reject);
//     });
//   }

//   // 🔐 3. ENCRYPT (AES-256)
//   private encrypt(file: string): Promise<string> {
//     return new Promise((resolve, reject) => {
//       const encryptedFile = `${file}.enc`;

//       const key = crypto.scryptSync(process.env.BACKUP_SECRET_KEY!, 'salt', 32);
//       const iv = crypto.randomBytes(16);

//       const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

//       const input = fs.createReadStream(file);
//       const output = fs.createWriteStream(encryptedFile);

//       output.write(iv);

//       input.pipe(cipher).pipe(output);

//       output.on('finish', () => resolve(encryptedFile));
//       output.on('error', reject);
//     });
//   }

//   // ☁️ 4. UPLOAD TO R2
//   private async uploadToR2(filePath: string, filename: string) {
//     const stream = fs.createReadStream(filePath);

//     await this.s3.send(
//       new PutObjectCommand({
//         Bucket: process.env.R2_BUCKET!,
//         Key: `backups/${filename}`,
//         Body: stream,
//       }),
//     );
//   }

//   // 🧾 5. SAVE META
//   private async saveMeta(filename: string) {
//     await this.db.backup.create({
//       data: {
//         filename,
//         size: fs.statSync(path.join(this.backupDir, filename)).size,
//         status: 'success',
//       },
//     });
//   }

//   // 🧹 6. CLEANUP
//   private cleanup(files: string[]) {
//     files.forEach((f) => {
//       if (fs.existsSync(f)) fs.unlinkSync(f);
//     });
//   }

//   private runRestore(file: string): Promise<void> {
//     return new Promise((resolve, reject) => {
//       exec(`psql ${process.env.DATABASE_URL} < ${file}`, (err) => {
//         if (err) return reject(err);
//         resolve();
//       });
//     });
//   }

//   private decrypt(filePath: string): Promise<string> {
//     const fs = require('fs');
//     const crypto = require('crypto');
//     const path = require('path');

//     return new Promise((resolve, reject) => {
//       const key = crypto.scryptSync(process.env.BACKUP_SECRET_KEY!, 'salt', 32);

//       const input = fs.createReadStream(filePath);

//       const iv = Buffer.alloc(16);
//       let ivRead = false;

//       const chunks: any[] = [];

//       input.on('data', (chunk) => {
//         if (!ivRead) {
//           chunk.copy(iv, 0, 0, 16);
//           chunks.push(chunk.slice(16));
//           ivRead = true;
//         } else {
//           chunks.push(chunk);
//         }
//       });

//       input.on('end', () => {
//         const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

//         const decryptedPath = filePath.replace('.enc', '.dec.gz');
//         const output = fs.createWriteStream(decryptedPath);

//         output.write(Buffer.concat(chunks).toString());

//         output.end();

//         resolve(decryptedPath);
//       });

//       input.on('error', reject);
//     });
//   }

//   private unzip(file: string): Promise<string> {
//     const fs = require('fs');
//     const zlib = require('zlib');
//     const path = require('path');

//     return new Promise((resolve, reject) => {
//       const outputFile = file.replace('.gz', '');

//       const input = fs.createReadStream(file);
//       const output = fs.createWriteStream(outputFile);
//       const gunzip = zlib.createGunzip();

//       input.pipe(gunzip).pipe(output);

//       output.on('finish', () => resolve(outputFile));
//       output.on('error', reject);
//     });
//   }

//   async restoreBackup(filename: string) {
//     const filePath = path.join(this.backupDir, filename);

//     // 1. decrypt
//     const decrypted = await this.decrypt(filePath);

//     // 2. unzip
//     const sqlFile = await this.unzip(decrypted);

//     // 3. restore DB
//     await this.runRestore(sqlFile);
//   }

//   async autoMigrationCheck() {
//     try {
//       await this.db.prisma.user.findFirst();
//     } catch (e) {
//       this.logger.warn('DB empty or broken → restoring backup...');

//       const latest = await this.db.backup.findFirst({
//         orderBy: { createdAt: 'desc' },
//       });

//       if (latest) {
//         await this.restoreBackup(latest.filename);
//       }
//     }
//   }

//   async onApplicationBootstrap() {
//     setTimeout(async () => {
//       await this.autoMigrationCheck();
//       await this.runBackup();
//     }, 30000);
//   }
// }
