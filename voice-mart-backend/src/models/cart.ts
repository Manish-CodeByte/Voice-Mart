export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  addedAt: Date;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  updatedAt: Date;
}

export interface AddToCartDTO {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDTO {
  quantity: number;
}
