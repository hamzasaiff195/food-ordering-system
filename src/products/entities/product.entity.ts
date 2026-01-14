import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { ProductVariant } from '../../variants';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
@Index('idx_product_name', ['name'])
@Index('idx_category_isAvailable', ['category', 'is_available'])
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index() // simple index on name
  name: string; // Product name, e.g., "Chicken Wings"

  @Column({ nullable: true })
  description: string; // e.g., "Spicy grilled wings served with sauce"

  @Column({ nullable: true })
  image: string; // URL to product image

  @Column({ nullable: true })
  category: string; // e.g., "Appetizer", "Burger", "Drinks"

  @Column({ type: 'decimal', default: 0 })
  base_price: number; // Base price if no variants

  @Column({ type: 'json', nullable: true })
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }; // Optional nutritional info

  @Column({ default: true })
  @Index() // index on availability for fast filtering
  is_available: boolean; // For soft delete / availability toggle

  @OneToMany(
    () => ProductVariant,
    (variant: ProductVariant) => variant.product,
    {
      cascade: true,
    },
  )
  variants: ProductVariant[];
}
