// product.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from '../variants/entities/variants.entity';
import { CreateProductDto } from './dto/add-product.dto';
import { CreateVariantDto } from 'src/variants';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variants: Repository<ProductVariant>,

    private readonly dataSource: DataSource, // For transactions
  ) {}

  async createProduct(dto: CreateProductDto): Promise<Product> {
    // Use a transaction to ensure product and variants are saved together
    return this.dataSource.transaction(async (manager) => {
      try {
        // 1️⃣ Save product first to get an ID
        const product = manager.create(Product, {
          name: dto.name,
          description: dto.description,
          base_price: dto.basePrice,
        });

        const savedProduct = await manager.save(product);

        // 2️⃣ Save variants with product_id
        if (dto.variants?.length) {
          const variantEntities = dto.variants.map((v: CreateVariantDto) =>
            manager.create(ProductVariant, {
              name: v.name,
              price: v.price,
              product: savedProduct, // attach saved product so product_id is set
            }),
          );

          await manager.save(variantEntities);
          savedProduct.variants = variantEntities;
        }

        // 3️⃣ Return product with variants including product_id
        return savedProduct;
      } catch (error) {
        console.error('Error saving product with variants:', error);
        throw new InternalServerErrorException(
          'Failed to create product with variants',
        );
      }
    });
  }

  async getAllProducts(
    page = 1,
    limit = 10,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.products.findAndCount({
      relations: ['variants'],
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async getProductById(id: string): Promise<Product> {
    return this.products.findOne({
      where: { id },
      relations: ['variants'],
    });
  }
}
