import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// 👉 Swagger import
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('App') // group nomi
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Hello endpoint' }) // endpoint haqida qisqa info
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: {
      example: 'Hello World',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
