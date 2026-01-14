import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from 'src/common/redis.service';
import { Cart, CartItem } from 'utils';

@Injectable()
export class CartService {
  constructor(private readonly redis: RedisService) {}

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
   * @returns
   */
  async getCart(userId: string): Promise<Cart> {
    const cart = await this.redis.get(this.getCartKey(userId));
    return cart || { userId, items: [], total: 0 };
  }

  /**
   *
   * @param userId
   * @param item
   * @returns
   */
  async addItem(userId: string, item: CartItem): Promise<Cart> {
    const cart = await this.getCart(userId);

    const existing = cart.items.find(
      (i) => i.productId === item.productId && i.variantId === item.variantId,
    );

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.items.push(item);
    }

    cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const ttl = parseInt(process.env['REDIS_CART_TTL']) || 3600; // 1 hour
    await this.redis.set(this.getCartKey(userId), cart, ttl);
    return cart;
  }

  /**
   *
   * @param userId
   * @param item
   * @returns
   */
  async updateItem(userId: string, item: CartItem): Promise<Cart> {
    const cart = await this.getCart(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new NotFoundException('Cart is empty');
    }

    const existing = cart.items.find(
      (i) => i.productId === item.productId && i.variantId === item.variantId,
    );

    if (!existing) {
      throw new NotFoundException('Item not found in cart');
    }

    // Update quantity
    existing.quantity = item.quantity;

    // Recalculate total
    cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Save updated cart with TTL
    const ttl = parseInt(process.env.REDIS_CART_TTL) || 3600; // 1 hour default
    await this.redis.set(this.getCartKey(userId), cart, ttl);

    return cart;
  }

  /**
   *
   * @param userId
   * @param productId
   * @param variantId
   * @returns
   */
  async removeItem(
    userId: string,
    productId: string,
    variantId?: string,
  ): Promise<Cart> {
    const cart = await this.getCart(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new NotFoundException('Cart is empty');
    }

    const itemIndex = cart.items.findIndex(
      (i) => i.productId === productId && i.variantId === variantId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart');
    }

    // Remove the item
    cart.items.splice(itemIndex, 1);

    // Recalculate total
    cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Save updated cart to Redis with TTL
    const ttl = parseInt(process.env.REDIS_CART_TTL) || 3600;
    await this.redis.set(this.getCartKey(userId), cart, ttl);

    return cart;
  }
  /**
   *
   * @param userId
   */
  async clearCart(userId: string) {
    await this.redis.del(this.getCartKey(userId));
  }
}
