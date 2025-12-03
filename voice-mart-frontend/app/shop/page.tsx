'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import CustomSelect from '@/components/CustomSelect';
import { Search, Filter, ArrowUpDown, Camera, X } from 'lucide-react';
import { Trans } from '@/app/context/Translator';
import { toast } from 'sonner';

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageSearching, setImageSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read URL parameters on mount
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlMinPrice = searchParams.get('minPrice');
    const urlMaxPrice = searchParams.get('maxPrice');
    
    if (urlSearch) setSearchQuery(urlSearch);
  }, [searchParams]);

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
    const searchParams = new URLSearchParams(window.location.search);
    const urlMinPrice = searchParams.get('minPrice');
    const urlMaxPrice = searchParams.get('maxPrice');
    
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

    // Apply price filters from URL
    if (urlMinPrice) {
      const minPrice = parseInt(urlMinPrice);
      result = result.filter(product => product.price >= minPrice);
    }
    
    if (urlMaxPrice) {
      const maxPrice = parseInt(urlMaxPrice);
      result = result.filter(product => product.price <= maxPrice);
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setShowImageModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleImageSearch = async () => {
    if (!selectedImage) return;

    setImageSearching(true);
    setShowImageModal(false);

    try {
      toast.info('Searching for similar products...');
      
      // Call backend API
      const response = await api.searchByImage(selectedImage);
      
      if (response.success && response.data) {
        const products = response.data;
        const keywords = response.metadata?.keywords || [];
        
        // Check if we have a very high confidence match (exact product)
        if (products.length > 0) {
          const topProduct = products[0];
          
          // If we have labels/text that strongly match the top product, navigate to it
          const topProductName = topProduct.name.toLowerCase();
          const hasStrongMatch = keywords.some((keyword: string) => 
            topProductName.includes(keyword.toLowerCase()) && keyword.length > 3
          );
          
          // If only 1 product or very strong match, go directly to product page
          if (products.length === 1 || hasStrongMatch) {
            toast.success(`Found: ${topProduct.name}`);
            window.location.href = `/shop/${topProduct.id}`;
            return;
          }
        }
        
        // Multiple products - show search results
        setProducts(products);
        setFilteredProducts(products);
        
        toast.success(`Found ${products.length} similar products: ${keywords.slice(0, 3).join(', ')}`);
      } else {
        toast.error('No products found matching the image');
      }
      
    } catch (error) {
      console.error('Image search error:', error);
      toast.error('Failed to search by image. Please try again.');
    } finally {
      setImageSearching(false);
      setSelectedImage(null);
      setImagePreview(null);
    }
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
          <h1 className="text-4xl font-bold mb-2"><Trans>Shop Products</Trans></h1>
          <p className="text-muted-foreground">
            <Trans>Browse our collection of</Trans> {products.length} <Trans>products</Trans>
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
                className="w-full pl-12 pr-16 py-3 rounded-xl border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
              />
              
              {/* Image Search Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-accent transition-all"
                title="Search by image"
              >
                <Camera className="h-5 w-5 text-muted-foreground hover:text-primary" />
              </button>
              
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
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
            <p className="text-xl text-muted-foreground mb-4"><Trans>No products found</Trans></p>
            <p className="text-muted-foreground mb-6">
              {searchQuery || category
                ? 'Try adjusting your search or filters'
                : <Trans>No products available at the moment</Trans>}
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
                <Trans>Clear Filters</Trans>
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

      {/* Image Preview Modal */}
      {showImageModal && imagePreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border-2 border-border max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Search by Image</h2>
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="p-2 rounded-lg hover:bg-accent transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-auto max-h-96 object-contain rounded-lg bg-accent"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-border hover:bg-accent transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleImageSearch}
                disabled={imageSearching}
                className="flex-1 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {imageSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            <p className="text-sm text-muted-foreground mt-4 text-center">
              Note: Image search requires Google Vision API to be enabled
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>}>
      <ShopContent />
    </Suspense>
  );
}
