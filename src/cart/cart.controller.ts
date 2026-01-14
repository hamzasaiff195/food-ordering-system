// cart.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart, CartItem } from 'utils';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

export interface AddCartItemDto {
  userId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
}

export interface UpdateCartItemDto {
  userId: string;
  productId: string;
  variantId?: string;
  quantity: number;
}

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   *
   * @param req
   * @param res
   * @returns
   */
  // Get user's cart
  @UseGuards(JwtAuthGuard)
  @Get()
  async getCart(@Req() req: any, @Res() res: any) {
    const result = await this.cartService.getCart(req.user.userId);
    return res.status(HttpStatus.OK).json({
      message: 'Cart fetched successfully',
      data: result,
    });
  }

  /**
   *
   * @param body
   * @param req
   * @param res
   * @returns
   */
  // Add item to cart
  @UseGuards(JwtAuthGuard)
  @Post()
  async addItem(
    @Body() body: AddCartItemDto,
    @Req() req: any,
    @Res() res: any,
  ) {
    const item: CartItem = {
      productId: body.productId,
      variantId: body.variantId,
      quantity: body.quantity,
      price: body.price,
    };
    const result = await this.cartService.addItem(req.user.userId, item);
    return res.status(HttpStatus.CREATED).json({
      message: 'Item added to cart successfully',
      data: result,
    });
  }

  /**
   *
   * @param body
   * @param req
   * @param res
   * @returns
   */
  // Update quantity of an item
  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateItem(
    @Body() body: UpdateCartItemDto,
    @Req() req: any,
    @Res() res: any,
  ) {
    const item: CartItem = {
      productId: body.productId,
      variantId: body.variantId,
      quantity: body.quantity,
      price: 0,
    };
    const result = await this.cartService.updateItem(req.user.userId, item);
    return res.status(HttpStatus.OK).json({
      message: 'Cart item updated successfully',
      data: result,
    });
  }

  /**
   *
   * @param req
   * @param productId
   * @param variantId
   * @param res
   * @returns
   */
  // Remove an item from cart
  @UseGuards(JwtAuthGuard)
  @Delete(':productId')
  async removeItem(
    @Req() req: any,
    @Param('productId') productId: string,
    @Query('variantId') variantId: string,
    @Res() res: any,
  ) {
    const result = await this.cartService.removeItem(
      req.user.userId,
      productId,
      variantId,
    );
    return res.status(HttpStatus.OK).json({
      message: 'Cart item removed successfully',
      data: result,
    });
  }

  /**
   *
   * @param req
   * @param res
   * @returns
   */
  // Clear entire cart
  @UseGuards(JwtAuthGuard)
  @Delete()
  async clearCart(@Req() req: any, @Res() res: any) {
    await this.cartService.clearCart(req.user.userId);
    return res.status(HttpStatus.OK).json({
      message: 'Cart cleared successfully',
    });
  }
}
