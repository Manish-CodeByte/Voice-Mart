import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import addressService from '../services/addressService.js';
import logger from '../utils/logger.js';

export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const addresses = await addressService.getAddresses(userId);
    res.json({ success: true, data: addresses });
  } catch (error) {
    logger.error('Error in getAddresses:', error);
    res.status(500).json({ success: false, message: 'Failed to get addresses' });
  }
};

export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const address = await addressService.createAddress(userId, req.body);
    res.status(201).json({ success: true, data: address });
  } catch (error) {
    logger.error('Error in createAddress:', error);
    res.status(500).json({ success: false, message: 'Failed to create address' });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const address = await addressService.updateAddress(id, userId, req.body);
    res.json({ success: true, data: address });
  } catch (error) {
    logger.error('Error in updateAddress:', error);
    res.status(500).json({ success: false, message: 'Failed to update address' });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    await addressService.deleteAddress(id, userId);
    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    logger.error('Error in deleteAddress:', error);
    res.status(500).json({ success: false, message: 'Failed to delete address' });
  }
};

export const setDefaultAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const address = await addressService.setDefaultAddress(id, userId);
    res.json({ success: true, data: address });
  } catch (error) {
    logger.error('Error in setDefaultAddress:', error);
    res.status(500).json({ success: false, message: 'Failed to set default address' });
  }
};
