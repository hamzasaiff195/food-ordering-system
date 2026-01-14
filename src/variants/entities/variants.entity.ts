import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from '../../products';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class ProductVariant extends BaseEntity {
  @Column()
  name: string; // e.g., "8pc", "16pc", "Single", "Double"

  @Column({ type: 'decimal' })
  price: number; // Variant-specific price

  @Index()
  @Column({ nullable: true })
  sku?: string; // SKU code

  @Index()
  @Column({ default: true })
  is_available: boolean;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;
}
