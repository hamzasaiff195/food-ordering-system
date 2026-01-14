// cart.interface.ts
export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  total: number;
}

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
