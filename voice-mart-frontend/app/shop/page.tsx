'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import CustomSelect from '@/components/CustomSelect';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [products, searchQuery, category, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.getProducts({});
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

  const applyFiltersAndSort = () => {
    let result = [...products];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (category) {
      result = result.filter(product => product.category === category);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name-asc':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'newest':
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      default:
        // Default sorting (newest first if available)
        break;
    }

    setFilteredProducts(result);
  };

  const categories = [
    'Mobiles',
    'Laptops',
    'Electronics',
    'Fashion',
    'Home & Kitchen',
    'Sports & Fitness',
    'Books',
    'Beauty & Personal Care',
  ];

  const sortOptions = [
    { value: '', label: 'Default' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A-Z' },
    { value: 'name-desc', label: 'Name: Z-A' },
    { value: 'newest', label: 'Newest First' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Shop Products</h1>
          <p className="text-muted-foreground">
            Browse our collection of {products.length} products
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar and Sort */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, category, or tags..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Sort Dropdown */}
            <CustomSelect
              value={sortBy}
              onChange={setSortBy}
              options={sortOptions}
              className="min-w-[200px]"
            />
          </div>

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

          {/* Results Count */}
          {!loading && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
              {searchQuery && ` for "${searchQuery}"`}
              {category && ` in ${category}`}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground mb-4">No products found</p>
            <p className="text-muted-foreground mb-6">
              {searchQuery || category
                ? 'Try adjusting your search or filters'
                : 'No products available at the moment'}
            </p>
            {(searchQuery || category) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategory('');
                  setSortBy('');
                }}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
