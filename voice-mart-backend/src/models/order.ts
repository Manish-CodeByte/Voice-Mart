export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'failed' | 'refunded' | 'returned';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalItems: number;
  totalPrice: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentDetails?: {
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderDTO {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentDetails?: {
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  };
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
}
