export interface Wishlist {
  userId: string;
  productIds: string[];
  updatedAt: Date;
}

export interface AddToWishlistDTO {
  productId: string;
}
