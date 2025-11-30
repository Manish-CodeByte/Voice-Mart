import { db } from '../config/firebase.js';
import { Product, CreateProductDTO, ProductQuery } from '../models/product.js';
import logger from '../utils/logger.js';

class ProductService {
  private get collection() {
    if (!db || typeof db.collection !== 'function') {
      throw new Error('Firestore is not initialized');
    }
    return db.collection('products');
  }

  async getAllProducts(query: ProductQuery = {}): Promise<Product[]> {
    try {
      let dbQuery = this.collection.orderBy('createdAt', 'desc');

      // Apply filters
      if (query.category) {
        dbQuery = dbQuery.where('category', '==', query.category);
      }

      if (query.minPrice !== undefined) {
        dbQuery = dbQuery.where('price', '>=', query.minPrice);
      }

      if (query.maxPrice !== undefined) {
        dbQuery = dbQuery.where('price', '<=', query.maxPrice);
      }

      // Apply sorting
      if (query.sortBy && query.sortBy !== 'createdAt') {
        dbQuery = dbQuery.orderBy(query.sortBy, query.sortOrder || 'asc');
      }

      // Apply limit
      if (query.limit) {
        dbQuery = dbQuery.limit(query.limit);
      }

      const snapshot = await dbQuery.get();
      let products: Product[] = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as Product));

      // Apply search filter (client-side since Firestore doesn't support full-text search)
      if (query.search) {
        const searchLower = query.search.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        );
      }

      logger.info(`Retrieved ${products.length} products`);
      return products;
    } catch (error) {
      logger.error('Error getting products:', error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const doc = await this.collection.doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()?.createdAt?.toDate(),
        updatedAt: doc.data()?.updatedAt?.toDate(),
      } as Product;
    } catch (error) {
      logger.error(`Error getting product ${id}:`, error);
      throw error;
    }
  }

  async createProduct(data: CreateProductDTO): Promise<Product> {
    try {
      const now = new Date();
      const productData = {
        ...data,
        rating: 0,
        reviews: 0,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await this.collection.add(productData);
      const product = await this.getProductById(docRef.id);
      
      logger.info(`Created product: ${docRef.id}`);
      return product!;
    } catch (error) {
      logger.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, data: Partial<CreateProductDTO>): Promise<Product | null> {
    try {
      await this.collection.doc(id).update({
        ...data,
        updatedAt: new Date(),
      });

      logger.info(`Updated product: ${id}`);
      return this.getProductById(id);
    } catch (error) {
      logger.error(`Error updating product ${id}:`, error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await this.collection.doc(id).delete();
      logger.info(`Deleted product: ${id}`);
    } catch (error) {
      logger.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  }
}

export default new ProductService();
