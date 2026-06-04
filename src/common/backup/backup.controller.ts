import { Controller, Post, UseGuards } from '@nestjs/common';
import { BackupService } from './backup.service';

// Xavfsizlik uchun: o'z AuthGuard ingizni qo'shing
// @UseGuards(YourAuthGuard)
@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  // POST /backup/trigger  →  manual backup ishga tushirish
  @Post('trigger')
  async triggerBackup() {
    return this.backupService.triggerManualBackup();
  }
}
