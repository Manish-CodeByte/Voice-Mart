import 'dotenv/config';
import productService from './services/productService.js';
import logger from './utils/logger.js';

const sampleProducts = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling headphones with 30-hour battery life',
    price: 2499,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
    category: 'Electronics',
    stock: 50,
    tags: ['audio', 'wireless', 'headphones'],
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Track your health with heart rate monitor, GPS, and sleep tracking',
    price: 1999,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
    category: 'Electronics',
    stock: 30,
    tags: ['fitness', 'smartwatch', 'health'],
  },
  {
    name: 'Laptop Stand Aluminum',
    description: 'Ergonomic adjustable laptop stand for better posture',
    price: 899,
    images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'],
    category: 'Home',
    stock: 100,
    tags: ['workspace', 'ergonomic', 'desk'],
  },
  {
    name: 'Cotton T-Shirt Pack',
    description: 'Premium quality 100% cotton t-shirts, pack of 3',
    price: 699,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
    category: 'Fashion',
    stock: 200,
    tags: ['clothing', 'cotton', 'casual'],
  },
  {
    name: 'Yoga Mat Pro',
    description: 'Non-slip exercise mat with carrying strap, 6mm thick',
    price: 499,
    images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'],
    category: 'Sports',
    stock: 75,
    tags: ['yoga', 'fitness', 'exercise'],
  },
  {
    name: 'Bestseller Novel Collection',
    description: 'Set of 5 award-winning fiction novels',
    price: 1299,
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500'],
    category: 'Books',
    stock: 40,
    tags: ['books', 'fiction', 'reading'],
  },
  {
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with adjustable DPI',
    price: 399,
    images: ['https://images.unsplash.com/photo-1527814050087-3793815479db?w=500'],
    category: 'Electronics',
    stock: 150,
    tags: ['computer', 'wireless', 'peripherals'],
  },
  {
    name: 'Backpack Laptop Bag',
    description: 'Water-resistant backpack with laptop compartment',
    price: 1599,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'],
    category: 'Fashion',
    stock: 60,
    tags: ['bag', 'travel', 'laptop'],
  },
];

async function seedProducts() {
  logger.info('Starting product seeding...');
  
  try {
    let successCount = 0;
    let errorCount = 0;

    for (const productData of sampleProducts) {
      try {
        await productService.createProduct(productData);
        logger.info(`✅ Created: ${productData.name}`);
        successCount++;
      } catch (error) {
        logger.error(`❌ Failed to create ${productData.name}:`, error);
        errorCount++;
      }
    }

    logger.info(`\n🎉 Seeding complete!`);
    logger.info(`✅ Successfully created: ${successCount} products`);
    if (errorCount > 0) {
      logger.info(`❌ Failed: ${errorCount} products`);
    }
    
    process.exit(0);
  } catch (error) {
    logger.error('Error during seeding:', error);
    process.exit(1);
  }
}

seedProducts();
