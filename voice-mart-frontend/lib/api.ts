const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// API client with authentication
export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; message?: string }> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Token will be added by the calling component using useAuth
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Helper to add auth token
  private withAuth(headers: Record<string, string> = {}): Record<string, string> {
    return headers;
  }

  // Products
  async getProducts(params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
  }, token?: string) {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString() ? '?' + queryParams.toString() : '';
    return this.request(`/products${queryString}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  // Cart
  async getCart(token: string) {
    return this.request('/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async addToCart(productId: string, quantity: number = 1, token: string) {
    return this.request('/cart', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(productId: string, quantity: number, token: string) {
    return this.request(`/cart/${productId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(productId: string, token: string) {
    return this.request(`/cart/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async clearCart(token: string) {
    return this.request('/cart', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Wishlist
  async getWishlist(token: string) {
    return this.request('/wishlist', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async addToWishlist(productId: string, token: string) {
    return this.request('/wishlist', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ productId }),
    });
  }

  async removeFromWishlist(productId: string, token: string) {
    return this.request(`/wishlist/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Orders
  async getOrders(token: string) {
    return this.request('/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getOrder(id: string, token: string) {
    return this.request(`/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async createOrder(data: {
    items: any[];
    shippingAddress: any;
    paymentMethod: string;
  }, token: string) {
    return this.request('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }

  async cancelOrder(id: string, token: string) {
    return this.request(`/orders/${id}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

export const api = new ApiClient();
