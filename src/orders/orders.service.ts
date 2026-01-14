import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { RedisService } from '../common/redis.service';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entitites/order.entity';
import { CreateOrderDto } from './dto/payment-type.dto';
import { UpdatePaymentDto } from './dto/update-paymemt.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly redis: RedisService,
    @InjectQueue('orders') private readonly orderQueue: Queue,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  /**
   *
   * @param userId
   * @returns
   */
  private getCartKey(userId: string) {
    return `cart:${userId}`;
  }

  /**
   *
   * @param userId
   * @param dto
   * @returns
   */
  async createOrder(userId: string, dto: CreateOrderDto): Promise<Order> {
    const cart = await this.redis.get(this.getCartKey(userId));
    if (!cart || !cart.items.length) {
      throw new NotFoundException('Cart is empty');
    }

    const order: Order = {
      id: randomUUID(),
      userId,
      items: cart.items,
      total: cart.total,
      paymentType: dto.paymentType,
      status: 'pending',
    } as Order;

    // Push to queue for async DB save
    await this.orderQueue.add('create-order', order);

    // Clear user's cart
    await this.redis.del(this.getCartKey(userId));

    return order;
  }

  /**
   *
   * @param dto
   * @returns
   */
  async updatePaymentStatus(dto: UpdatePaymentDto): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: dto.orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    order.status = dto.status;
    order.updated_at = new Date();

    return this.orderRepository.save(order);
  }

  /**
   *
   * @param orderId
   * @returns
   */
  async getOrderById(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  /**
   *
   * @param userId
   * @returns
   */
  async getOrdersByUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      order: { created_at: 'DESC' },
    });
  }
}
