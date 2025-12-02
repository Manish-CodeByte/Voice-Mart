import { Request, Response } from 'express';
import productService from '../services/productService.js';
import { ProductQuery } from '../models/product.js';
import logger from '../utils/logger.js';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const query: ProductQuery = {
      category: req.query.category as string,
      search: req.query.search as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : 100,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
    };

    const products = await productService.getAllProducts(query);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

export const getSearchSuggestions = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      res.json({ success: true, data: [] });
      return;
    }

    const suggestions = await productService.searchProducts(query);
    res.json({ success: true, data: suggestions });
  } catch (error) {
    logger.error('Error in getSearchSuggestions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch suggestions' });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    logger.error('Error in getProduct:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    logger.error('Error in createProduct:', error);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    logger.error('Error in updateProduct:', error);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    logger.error('Error in deleteProduct:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};
