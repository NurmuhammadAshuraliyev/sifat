import { Module } from '@nestjs/common';
import { HisobotController } from './hisobot.controller';
import { HisobotService } from './hisobot.service';

@Module({
  controllers: [HisobotController],
  providers: [HisobotService],
})
export class HisobotModule {}
