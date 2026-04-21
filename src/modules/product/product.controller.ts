// src/product/product.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductFilterDto } from './dto/product-filter.dto';
import { CreateProductDto } from './dto/Create.product.dto';
import { UpdateProductDto } from './dto/Update.product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(@Query() filters: ProductFilterDto) {
    return await this.productService.findAll(filters);
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productService.create(createProductDto);
  }

  @Put('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productService.update(id, updateProductDto);
  }

  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    return await this.productService.remove(id);
  }
}
