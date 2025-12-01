import 'dotenv/config';
import productService from './services/productService.js';
import logger from './utils/logger.js';

const sampleProducts = [
  // Mobiles (10 products)
  {
    name: 'iPhone 15 Pro Max',
    description: 'Latest Apple flagship with A17 Pro chip, titanium design, and 48MP camera system',
    price: 134900,
    images: ['https://images.unsplash.com/photo-1592286927505-c6d0d68f0024?w=500'],
    category: 'Mobiles',
    stock: 25,
    tags: ['smartphone', 'apple', 'flagship'],
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Premium Android phone with S Pen, 200MP camera, and AI features',
    price: 124999,
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500'],
    category: 'Mobiles',
    stock: 30,
    tags: ['smartphone', 'samsung', 'android'],
  },
  {
    name: 'Google Pixel 8 Pro',
    description: 'Pure Android experience with best-in-class camera and AI capabilities',
    price: 84999,
    images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500'],
    category: 'Mobiles',
    stock: 20,
    tags: ['smartphone', 'google', 'pixel'],
  },
  {
    name: 'OnePlus 12',
    description: 'Flagship killer with Snapdragon 8 Gen 3, 100W fast charging',
    price: 64999,
    images: ['https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=500'],
    category: 'Mobiles',
    stock: 40,
    tags: ['smartphone', 'oneplus', 'performance'],
  },
  {
    name: 'Xiaomi 14 Pro',
    description: 'Premium camera phone co-engineered with Leica optics',
    price: 69999,
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'],
    category: 'Mobiles',
    stock: 35,
    tags: ['smartphone', 'xiaomi', 'camera'],
  },
  {
    name: 'iPhone 14',
    description: 'Reliable Apple phone with A15 Bionic chip and dual camera',
    price: 69900,
    images: ['https://images.unsplash.com/photo-1663499482523-1c0e6c8f6e8d?w=500'],
    category: 'Mobiles',
    stock: 45,
    tags: ['smartphone', 'apple', 'ios'],
  },
  {
    name: 'Samsung Galaxy A54',
    description: 'Mid-range champion with premium features at affordable price',
    price: 38999,
    images: ['https://images.unsplash.com/photo-1618868881967-1cbaf673bb1a?w=500'],
    category: 'Mobiles',
    stock: 60,
    tags: ['smartphone', 'samsung', 'midrange'],
  },
  {
    name: 'Nothing Phone 2',
    description: 'Unique transparent design with RGB glyph interface',
    price: 44999,
    images: ['https://images.unsplash.com/photo-1678685888221-cda52f6e8543?w=500'],
    category: 'Mobiles',
    stock: 28,
    tags: ['smartphone', 'nothing', 'unique'],
  },
  {
    name: 'Realme GT 3',
    description: 'Gaming phone with 240W charging and Snapdragon processor',
    price: 42999,
    images: ['https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500'],
    category: 'Mobiles',
    stock: 50,
    tags: ['smartphone', 'realme', 'gaming'],
  },
  {
    name: 'Motorola Edge 40',
    description: 'Clean Android with curved display and premium build',
    price: 29999,
    images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500'],
    category: 'Mobiles',
    stock: 38,
    tags: ['smartphone', 'motorola', 'clean'],
  },

  // Laptops (10 products)
  {
    name: 'MacBook Pro 16" M3 Max',
    description: 'Ultimate professional laptop with M3 Max chip, 64GB RAM, stunning display',
    price: 349900,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
    category: 'Laptops',
    stock: 15,
    tags: ['laptop', 'apple', 'professional'],
  },
  {
    name: 'Dell XPS 15',
    description: 'Premium Windows laptop with 4K OLED display and Intel i9',
    price: 189999,
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500'],
    category: 'Laptops',
    stock: 20,
    tags: ['laptop', 'dell', 'windows'],
  },
  {
    name: 'HP Spectre x360',
    description: '2-in-1 convertible laptop with pen support and long battery life',
    price: 129999,
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500'],
    category: 'Laptops',
    stock: 25,
    tags: ['laptop', 'hp', 'convertible'],
  },
  {
    name: 'Lenovo ThinkPad X1 Carbon',
    description: 'Business ultrabook with legendary keyboard and military-grade durability',
    price: 149999,
    images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500'],
    category: 'Laptops',
    stock: 30,
    tags: ['laptop', 'lenovo', 'business'],
  },
  {
    name: 'ASUS ROG Zephyrus G14',
    description: 'Compact gaming laptop with RTX 4060 and AMD Ryzen 9',
    price: 159999,
    images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500'],
    category: 'Laptops',
    stock: 18,
    tags: ['laptop', 'asus', 'gaming'],
  },
  {
    name: 'Microsoft Surface Laptop 5',
    description: 'Elegant Windows laptop with touchscreen and premium build quality',
    price: 119999,
    images: ['https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=500'],
    category: 'Laptops',
    stock: 22,
    tags: ['laptop', 'microsoft', 'surface'],
  },
  {
    name: 'Acer Predator Helios 16',
    description: 'Powerful gaming beast with RTX 4070 and 240Hz display',
    price: 179999,
    images: ['https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500'],
    category: 'Laptops',
    stock: 12,
    tags: ['laptop', 'acer', 'gaming'],
  },
  {
    name: 'LG Gram 17',
    description: 'Ultra-lightweight 17" laptop weighing just 1.35kg with all-day battery',
    price: 134999,
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'],
    category: 'Laptops',
    stock: 16,
    tags: ['laptop', 'lg', 'lightweight'],
  },
  {
    name: 'MacBook Air M2',
    description: 'Thin and light laptop with incredible battery life and M2 performance',
    price: 114900,
    images: ['https://images.unsplash.com/photo-1606229365485-93a3b8ee0385?w=500'],
    category: 'Laptops',
    stock: 40,
    tags: ['laptop', 'apple', 'portable'],
  },
  {
    name: 'MSI Creator Z16',
    description: 'Content creation laptop with color-accurate display and RTX graphics',
    price: 199999,
    images: ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500'],
    category: 'Laptops',
    stock: 14,
    tags: ['laptop', 'msi', 'creator'],
  },

  // Electronics (10 products)
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling headphones with 30-hour battery life and superior sound quality',
    price: 2499,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
    category: 'Electronics',
    stock: 50,
    tags: ['audio', 'wireless', 'headphones'],
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Track your health with heart rate monitor, GPS, and sleep tracking features',
    price: 1999,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
    category: 'Electronics',
    stock: 30,
    tags: ['fitness', 'smartwatch', 'health'],
  },
  {
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with adjustable DPI and precision tracking',
    price: 399,
    images: ['https://images.unsplash.com/photo-1527814050087-3793815479db?w=500'],
    category: 'Electronics',
    stock: 150,
    tags: ['computer', 'wireless', 'peripherals'],
  },
  {
    name: '4K Ultra HD Webcam',
    description: 'Professional webcam with auto-focus and noise-cancelling dual microphones',
    price: 3499,
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500'],
    category: 'Electronics',
    stock: 25,
    tags: ['camera', 'streaming', 'video'],
  },
  {
    name: 'Portable Power Bank 20000mAh',
    description: 'Fast charging power bank with dual USB ports and LED display',
    price: 1299,
    images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500'],
    category: 'Electronics',
    stock: 80,
    tags: ['charging', 'portable', 'battery'],
  },
  {
    name: 'USB-C Hub 7-in-1',
    description: 'Multi-port hub with HDMI, USB 3.0, SD card reader, and ethernet',
    price: 1899,
    images: ['https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500'],
    category: 'Electronics',
    stock: 45,
    tags: ['usb', 'hub', 'adapter'],
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB backlit mechanical keyboard with blue switches and wrist rest',
    price: 3999,
    images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?w=500'],
    category: 'Electronics',
    stock: 35,
    tags: ['gaming', 'keyboard', 'rgb'],
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Waterproof speaker with 360° sound and 12-hour battery life',
    price: 1599,
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500'],
    category: 'Electronics',
    stock: 60,
    tags: ['audio', 'bluetooth', 'speaker'],
  },
  {
    name: 'Smart LED Light Bulbs (4-Pack)',
    description: 'WiFi enabled color-changing LED bulbs with voice control',
    price: 1999,
    images: ['https://images.unsplash.com/photo-1558618666-fa6a2d536ec0?w=500'],
    category: 'Electronics',
    stock: 100,
    tags: ['smart home', 'lighting', 'wifi'],
  },
  {
    name: 'Wireless Charging Pad',
    description: 'Fast wireless charger compatible with all Qi-enabled devices',
    price: 899,
    images: ['https://images.unsplash.com/photo-1591290619762-7e79f671b8ad?w=500'],
    category: 'Electronics',
    stock: 120,
    tags: ['charging', 'wireless', 'qi'],
  },

  // Fashion (10 products)
  {
    name: 'Cotton T-Shirt Pack of 3',
    description: 'Premium quality 100% cotton t-shirts in assorted colors',
    price: 699,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
    category: 'Fashion',
    stock: 200,
    tags: ['clothing', 'cotton', 'casual'],
  },
  {
    name: 'Denim Jeans Slim Fit',
    description: 'Comfortable stretch denim jeans with modern slim fit',
    price: 1499,
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'],
    category: 'Fashion',
    stock: 90,
    tags: ['jeans', 'denim', 'pants'],
  },
  {
    name: 'Leather Wallet',
    description: 'Genuine leather bifold wallet with multiple card slots',
    price: 999,
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=500'],
    category: 'Fashion',
    stock: 75,
    tags: ['wallet', 'leather', 'accessories'],
  },
  {
    name: 'Backpack Laptop Bag',
    description: 'Water-resistant backpack with padded laptop compartment up to 15.6"',
    price: 1599,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'],
    category: 'Fashion',
    stock: 60,
    tags: ['bag', 'travel', 'laptop'],
  },
  {
    name: 'Polarized Sunglasses',
    description: 'UV400 protection polarized sunglasses with metal frame',
    price: 799,
    images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500'],
    category: 'Fashion',
    stock: 85,
    tags: ['sunglasses', 'eyewear', 'uv protection'],
  },
  {
    name: 'Sports Hoodie',
    description: 'Comfortable fleece hoodie with kangaroo pocket and adjustable hood',
    price: 1299,
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'],
    category: 'Fashion',
    stock: 110,
    tags: ['hoodie', 'sportswear', 'casual'],
  },
  {
    name: 'Canvas Sneakers',
    description: 'Classic canvas sneakers with cushioned insole and rubber sole',
    price: 1799,
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500'],
    category: 'Fashion',
    stock: 70,
    tags: ['shoes', 'sneakers', 'casual'],
  },
  {
    name: 'Watch Analog Quartz',
    description: 'Elegant analog watch with stainless steel case and leather strap',
    price: 2499,
    images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500'],
    category: 'Fashion',
    stock: 40,
    tags: ['watch', 'accessories', 'analog'],
  },
  {
    name: 'Belt Genuine Leather',
    description: 'Classic leather belt with reversible buckle, black and brown',
    price: 699,
    images: ['https://images.unsplash.com/photo-1624222247135-ee18d0fc911d?w=500'],
    category: 'Fashion',
    stock: 95,
    tags: ['belt', 'leather', 'accessories'],
  },
  {
    name: 'Baseball Cap',
    description: 'Adjustable cotton baseball cap with curved brim',
    price: 499,
    images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500'],
    category: 'Fashion',
    stock: 130,
    tags: ['cap', 'hat', 'casual'],
  },

  // Home & Kitchen (8 products)
  {
    name: 'Laptop Stand Aluminum',
    description: 'Ergonomic adjustable laptop stand for better posture and cooling',
    price: 899,
    images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'],
    category: 'Home & Kitchen',
    stock: 100,
    tags: ['workspace', 'ergonomic', 'desk'],
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated water bottle keeps drinks cold for 24hrs, hot for 12hrs',
    price: 699,
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500'],
    category: 'Home & Kitchen',
    stock: 150,
    tags: ['bottle', 'hydration', 'insulated'],
  },
  {
    name: 'Non-Stick Cookware Set',
    description: 'Complete 10-piece non-stick cookware set with glass lids',
    price: 3499,
    images: ['https://images.unsplash.com/photo-1584990347449-39f0578b3228?w=500'],
    category: 'Home & Kitchen',
    stock: 30,
    tags: ['cookware', 'kitchen', 'cooking'],
  },
  {
    name: 'Coffee Maker Drip',
    description: '12-cup programmable coffee maker with auto shut-off',
    price: 2299,
    images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500'],
    category: 'Home & Kitchen',
    stock: 45,
    tags: ['coffee', 'appliance', 'kitchen'],
  },
  {
    name: 'Knife Set with Block',
    description: 'Professional 6-piece stainless steel knife set with wooden block',
    price: 1899,
    images: ['https://images.unsplash.com/photo-1593618998160-e34014dd0d8d?w=500'],
    category: 'Home & Kitchen',
    stock: 55,
    tags: ['knives', 'kitchen', 'cooking'],
  },
  {
    name: 'Bedsheet Set Queen Size',
    description: 'Soft microfiber bedsheet set with pillowcases, wrinkle resistant',
    price: 1599,
    images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500'],
    category: 'Home & Kitchen',
    stock: 65,
    tags: ['bedding', 'sheets', 'bedroom'],
  },
  {
    name: 'LED Desk Lamp',
    description: 'Adjustable LED desk lamp with USB charging port and touch control',
    price: 1199,
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500'],
    category: 'Home & Kitchen',
    stock: 80,
    tags: ['lighting', 'desk', 'led'],
  },
  {
    name: 'Wall Clock Modern',
    description: 'Silent quartz wall clock with large numbers, easy to read',
    price: 599,
    images: ['https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500'],
    category: 'Home & Kitchen',
    stock: 90,
    tags: ['clock', 'wall decor', 'home'],
  },

  // Sports & Fitness (6 products)
  {
    name: 'Yoga Mat Pro 6mm',
    description: 'Non-slip exercise mat with carrying strap, eco-friendly material',
    price: 899,
    images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'],
    category: 'Sports & Fitness',
    stock: 75,
    tags: ['yoga', 'fitness', 'exercise'],
  },
  {
    name: 'Dumbbell Set Adjustable',
    description: 'Adjustable dumbbells from 5-25kg with quick-select technology',
    price: 4999,
    images: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500'],
    category: 'Sports & Fitness',
    stock: 25,
    tags: ['weights', 'strength', 'gym'],
  },
  {
    name: 'Resistance Bands Set',
    description: 'Set of 5 resistance bands with different tension levels',
    price: 799,
    images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500'],
    category: 'Sports & Fitness',
    stock: 100,
    tags: ['resistance', 'bands', 'workout'],
  },
  {
    name: 'Running Shoes Lightweight',
    description: 'Breathable mesh running shoes with cushioned sole',
    price: 2499,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
    category: 'Sports & Fitness',
    stock: 60,
    tags: ['running', 'shoes', 'sports'],
  },
  {
    name: 'Jump Rope Speed',
    description: 'Adjustable jump rope with ball bearings for smooth rotation',
    price: 399,
    images: ['https://images.unsplash.com/photo-1517838941154-4ca1d86e71b2?w=500'],
    category: 'Sports & Fitness',
    stock: 120,
    tags: ['cardio', 'jump rope', 'fitness'],
  },
  {
    name: 'Gym Bag Duffel',
    description: 'Spacious gym bag with shoe compartment and water bottle holder',
    price: 1299,
    images: ['https://images.unsplash.com/photo-1547949003-9792a18a2601?w=500'],
    category: 'Sports & Fitness',
    stock: 50,
    tags: ['bag', 'gym', 'travel'],
  },

  // Books (4 products)
  {
    name: 'Bestseller Novel Collection',
    description: 'Set of 5 award-winning fiction novels from top authors',
    price: 1299,
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500'],
    category: 'Books',
    stock: 40,
    tags: ['books', 'fiction', 'reading'],
  },
  {
    name: 'Self-Help Book Bundle',
    description: 'Collection of 3 transformative self-improvement books',
    price: 899,
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'],
    category: 'Books',
    stock: 55,
    tags: ['self-help', 'motivation', 'books'],
  },
  {
    name: 'Cookbook Mediterranean',
    description: 'Mediterranean cooking guide with 150+ healthy recipes',
    price: 699,
    images: ['https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500'],
    category: 'Books',
    stock: 35,
    tags: ['cookbook', 'recipes', 'cooking'],
  },
  {
    name: 'Programming Guide for Beginners',
    description: 'Comprehensive guide to learn Python programming from scratch',
    price: 999,
    images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500'],
    category: 'Books',
    stock: 45,
    tags: ['programming', 'education', 'tech'],
  },

  // Beauty & Personal Care (4 products)
  {
    name: 'Electric Toothbrush',
    description: 'Rechargeable sonic toothbrush with 3 cleaning modes',
    price: 1899,
    images: ['https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500'],
    category: 'Beauty & Personal Care',
    stock: 70,
    tags: ['dental', 'hygiene', 'electric'],
  },
  {
    name: 'Hair Dryer Professional',
    description: 'Ionic hair dryer with 3 heat settings and cool shot button',
    price: 1599,
    images: ['https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=500'],
    category: 'Beauty & Personal Care',
    stock: 40,
    tags: ['hair care', 'styling', 'dryer'],
  },
  {
    name: 'Skincare Set Complete',
    description: '5-step skincare routine set with cleanser, toner, and moisturizer',
    price: 2499,
    images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500'],
    category: 'Beauty & Personal Care',
    stock: 50,
    tags: ['skincare', 'beauty', 'cosmetics'],
  },
  {
    name: 'Perfume Gift Set',
    description: 'Luxury fragrance collection with 4 different scents',
    price: 3499,
    images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=500'],
    category: 'Beauty & Personal Care',
    stock: 30,
    tags: ['perfume', 'fragrance', 'gift'],
  },
];

import { userService } from './services/userService.js';

const sampleUsers = [
  {
    uid: 'user_1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
  },
  {
    uid: 'user_2',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
  },
  {
    uid: 'user_3',
    email: 'mike.wilson@example.com',
    firstName: 'Mike',
    lastName: 'Wilson',
  },
  {
    uid: 'user_4',
    email: 'sarah.jones@example.com',
    firstName: 'Sarah',
    lastName: 'Jones',
  },
  {
    uid: 'user_5',
    email: 'david.brown@example.com',
    firstName: 'David',
    lastName: 'Brown',
  }
];

async function seedProducts() {
  logger.info('Starting seeding...');
  
  try {
    // Seed Users
    logger.info('Seeding users...');
    for (const user of sampleUsers) {
      try {
        await userService.createUser(user);
        logger.info(`✅ Created user: ${user.firstName} ${user.lastName}`);
      } catch (error) {
        logger.error(`❌ Failed to create user ${user.email}:`, error);
      }
    }
    logger.info('Users seeded.\n');

    logger.info(`Total products to seed: ${sampleProducts.length}\n`);
    // Clear existing products
    logger.info('Clearing existing products...');
    const snapshot = await productService.getAllProducts({ limit: 1000 });
    for (const product of snapshot) {
      await productService.deleteProduct(product.id);
    }
    logger.info('Existing products cleared.\n');

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
