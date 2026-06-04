import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class WalService {
  private walFile = path.join(process.cwd(), 'wal.log');

  constructor(private readonly db: PrismaService) {}

  async captureChange(action: string, table: string, data: any) {
    const log = {
      time: new Date().toISOString(),
      action,
      table,
      data,
    };

    fs.appendFileSync(this.walFile, JSON.stringify(log) + '\n');
  }
}
