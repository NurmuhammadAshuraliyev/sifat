// import { Controller, Param, Post, UseGuards } from '@nestjs/common';
// import { BackupService } from './backup.service';

// // Xavfsizlik uchun: o'z AuthGuard ingizni qo'shing
// // @UseGuards(YourAuthGuard)
// @Controller('backup')
// export class BackupController {
//   constructor(private readonly service: BackupService) {}

//   @Post('restore/:filename')
//   restore(@Param('filename') filename: string) {
//     return this.service.restoreBackup(filename);
//   }
// }
