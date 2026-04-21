import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './modules/product/product.module';
import { CoreModule } from './core/core.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { SaleModule } from './modules/sale/sale.module';
import { DebtModule } from './modules/debt/debt.module';
import { ReportModule } from './modules/report/report.module';
import { ReceiptModule } from './modules/receipt/receipt.module';
import { ProfileModule } from './modules/profile/profile.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './common/guard/auth.guard';
import TransformIntersector from './common/intersector/transform.intersector.service';

@Module({
  imports: [
    ProductModule,
    CoreModule,
    WarehouseModule,
    SaleModule,
    DebtModule,
    ReportModule,
    ReceiptModule,
    ProfileModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformIntersector,
    },
  ],
})
export class AppModule {}
