import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../entitites/order.entity';

@Processor('orders')
export class OrdersProcessor {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  // Process new order creation
  @Process('create-order')
  async handleCreateOrder(job: Job<Order>) {
    const order = job.data;
    await this.orderRepository.save(order);
    console.log(`Order saved: ${order.id}`);
  }

  // Optional: process payment updates asynchronously if needed
  @Process('update-payment')
  async handleUpdatePayment(
    job: Job<{ orderId: string; status: 'paid' | 'failed' }>,
  ) {
    const { orderId, status } = job.data;
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) return console.error(`Order not found: ${orderId}`);

    order.status = status;
    order.updated_at = new Date();
    await this.orderRepository.save(order);

    console.log(`Order ${orderId} payment updated to ${status}`);
  }
}
