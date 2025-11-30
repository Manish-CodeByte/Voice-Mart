'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Search, Filter } from 'lucide-react';

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (searchQuery) filters.search = searchQuery;
      if (category) filters.category = category;

      const response = await api.getProducts(filters);
      if (response.success && response.data) {
        setProducts(Array.isArray(response.data) ? response.data : []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const categories = ['Electronics', 'Fashion', 'Home', 'Sports', 'Books'];

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Shop Products</h1>
          <p className="text-muted-foreground">Browse our entire collection</p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
            />
          </form>

          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <button
              onClick={() => setCategory('')}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                category === ''
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  category === cat
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground mb-4">No products found</p>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
