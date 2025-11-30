export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  reviews: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  tags?: string[];
}

export interface ProductQuery {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
