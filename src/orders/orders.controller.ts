import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpStatus,
  Res,
  Patch,
  Param,
  Get,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { CreateOrderDto } from './dto/payment-type.dto';
import { UpdatePaymentDto } from './dto/update-paymemt.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrder(
    @Req() req: any,
    @Body() dto: CreateOrderDto,
    @Res() res: Response,
  ) {
    const order = await this.ordersService.createOrder(req.user.userId, dto);
    return res.status(HttpStatus.CREATED).json({
      message: 'Order placed successfully',
      data: order,
    });
  }

  // Update payment status (admin or webhook)
  @Patch('payment')
  async updatePayment(@Body() dto: UpdatePaymentDto, @Res() res: Response) {
    const order = await this.ordersService.updatePaymentStatus(dto);
    return res.status(HttpStatus.OK).json({
      message: 'Payment status updated',
      data: order,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':orderId')
  async getOrder(@Param('orderId') orderId: string, @Res() res: Response) {
    const order = await this.ordersService.getOrderById(orderId);
    return res.status(HttpStatus.OK).json({
      message: 'Order fetched successfully',
      data: order,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getOrdersByUser(@Req() req: any, @Res() res: Response) {
    const orders = await this.ordersService.getOrdersByUser(req.user.userId);
    return res.status(HttpStatus.OK).json({
      message: 'Orders fetched successfully',
      data: orders,
    });
  }
}
