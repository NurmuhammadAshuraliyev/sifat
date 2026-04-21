// src/product/product.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductFilterDto } from './dto/product-filter.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateProductDto } from './dto/Create.product.dto';
import { UpdateProductDto } from './dto/Update.product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly db: PrismaService) {}

  async findAll(filters: ProductFilterDto) {
    const where: any = {};

    if (filters.search) {
      where.name = {
        contains: filters.search,
        mode: 'insensitive' as const,
      };
    }

    if (filters.minPrice !== undefined) {
      where.sotish = { gte: filters.minPrice };
    }
    if (filters.maxPrice !== undefined) {
      where.sotish = {
        ...(where.sotish || {}),
        lte: filters.maxPrice,
      };
    }
    if (filters.minStock !== undefined) {
      where.stockKg = { gte: filters.minStock };
    }

    return await this.db.prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        category: true,
        tannarx: true,
        sotish: true,
        stockKg: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(data: CreateProductDto) {
    return await this.db.prisma.product.create({
      data: {
        name: data.name,
        category: data.category,
        tannarx: data.tannarx,
        sotish: data.sotish,
      },
    });
  }

  async update(id: string, data: UpdateProductDto) {
    return await this.db.prisma.product
      .update({
        where: { id },
        data,
      })
      .catch(() => {
        throw new NotFoundException(`Product with ID ${id} not found`);
      });
  }

  async remove(id: string) {
    const product = await this.db.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return await this.db.prisma.product.delete({ where: { id } }).catch(() => {
      throw new NotFoundException(`Product with ID ${id} not found`);
    });
  }
}
