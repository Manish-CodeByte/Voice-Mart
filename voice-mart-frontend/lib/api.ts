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

      // Handle non-JSON responses (like rate limit errors)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      } else {
        // Non-JSON response (e.g., rate limit error)
        const text = await response.text();
        return {
          success: false,
          message: text || 'Request failed',
        };
      }
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Request failed',
      };
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

  async getSearchSuggestions(query: string) {
    return this.request(`/products/search/suggestions?q=${encodeURIComponent(query)}`);
  }

  // Voice Assistant: Search products by query
  async searchProducts(query: string) {
    return this.request(`/products?search=${encodeURIComponent(query)}&limit=5`);
  }

  // Cart
  async getCart(token: string) {
    return this.request('/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async addToCart(productId: string, quantity: number, token: string) {
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

  // Addresses
  async getAddresses(token: string) {
    return this.request('/addresses', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async createAddress(data: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
  }, token: string) {
    return this.request('/addresses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }

  async updateAddress(id: string, data: any, token: string) {
    return this.request(`/addresses/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }

  async deleteAddress(id: string, token: string) {
    return this.request(`/addresses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async setDefaultAddress(id: string, token: string) {
    return this.request(`/addresses/${id}/default`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Admin APIs
  async createProduct(data: any, token: string) {
    return this.request('/admin/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: any, token: string) {
    return this.request(`/admin/products/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string, token: string) {
    return this.request(`/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getAllOrdersAdmin(token: string, status?: string) {
    const query = status && status !== 'all' ? `?status=${status}` : '';
    return this.request(`/admin/orders${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async updateOrderStatusAdmin(id: string, status: string, token: string) {
    return this.request(`/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
  }

  async getOrderStats(token: string) {
    return this.request('/admin/stats/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getAllUsers(token: string) {
    return this.request('/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getUserStats(token: string) {
    return this.request('/admin/stats/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // User Preferences
  async getPreferences(token: string) {
    return this.request('/preferences', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async updatePreferences(data: any, token: string) {
    return this.request('/preferences', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }

  // Reviews
  async createReview(data: {
    productId: string;
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
  }, token: string) {
    return this.request('/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }

  async getProductReviews(productId: string) {
    return this.request(`/reviews/product/${productId}`);
  }

  async getMyReviews(token: string) {
    return this.request('/reviews/my-reviews', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async updateReview(reviewId: string, data: {
    rating?: number;
    title?: string;
    comment?: string;
    images?: string[];
  }, token: string) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }

  async deleteReview(reviewId: string, token: string) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async markReviewHelpful(reviewId: string) {
    return this.request(`/reviews/${reviewId}/helpful`, {
      method: 'POST',
    });
  }
  // User Sync
  async syncUser(data: { email: string; firstName: string; lastName: string }, token: string) {
    return this.request('/auth/sync', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
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

  // Payment
  async createPaymentOrder(amount: number, token: string) {
    return this.request('/payment/create-order', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount }),
    });
  }

  async verifyPayment(data: any, token: string) {
    return this.request('/payment/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }
  async sendVoiceCommand(audioBlob: Blob, languageCode: string = 'en', context?: any) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'command.wav');
    
    // Map frontend language codes to Google STT format
    const languageMap: Record<string, string> = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'kn': 'kn-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'ml': 'ml-IN',
      'tu': 'en-IN' // Tulu fallback to English
    };
    
    const sttLanguageCode = languageMap[languageCode] || 'en-IN';
    formData.append('languageCode', sttLanguageCode);
    
    // Add context if provided
    if (context) {
      formData.append('context', JSON.stringify(context));
    }

    // We use fetch directly here because we need to send FormData
    // and our request helper is optimized for JSON
    const response = await fetch(`${this.baseURL}/voice/voice-command`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  }

  async searchByImage(imageFile: File) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${this.baseURL}/search/image`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  }
}

export const api = new ApiClient();
