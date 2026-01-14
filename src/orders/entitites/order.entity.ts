import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('orders')
@Index('idx_user_status', ['userId', 'status']) // composite index
@Index('idx_created_at', ['created_at']) // index on createdAt
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column({ type: 'jsonb' })
  items: any[];

  @Column({ type: 'numeric' })
  total: number;

  @Column()
  paymentType: 'cash' | 'card' | 'wallet';

  @Column()
  @Index()
  status: 'pending' | 'paid' | 'failed';
}
