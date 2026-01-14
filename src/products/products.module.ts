import { Module, forwardRef } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities';
import { VariantsModule } from '../variants/variants.module';
import { ProductVariant } from '../variants/entities/variants.entity';
import { DatabaseModule } from 'src/config';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Product, ProductVariant]),
    forwardRef(() => VariantsModule),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
