import { Module } from '@nestjs/common';
import { KassaController } from './kassa.controller';
import { KassaService } from './kassa.service';

@Module({
  controllers: [KassaController],
  providers: [KassaService],
})
export class KassaModule {}
