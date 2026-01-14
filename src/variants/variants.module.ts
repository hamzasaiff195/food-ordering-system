import { Module, forwardRef } from '@nestjs/common';
import { VariantsService } from './variants.service';
import { VariantsController } from './variants.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariant } from './entities';
import { ProductsModule } from '../products/products.module';
import { DatabaseModule } from 'src/config';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([ProductVariant]),
    forwardRef(() => ProductsModule),
  ],

  controllers: [VariantsController],
  providers: [VariantsService],
  exports: [VariantsService],
})
export class VariantsModule {}
