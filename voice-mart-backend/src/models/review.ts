export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  verified: boolean; // true if user purchased the product
  helpful: number; // count of helpful votes
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewDTO {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}

export interface UpdateReviewDTO {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
}
