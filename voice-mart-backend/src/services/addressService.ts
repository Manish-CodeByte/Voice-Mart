import { db } from '../config/firebase.js';
import { Address, CreateAddressDTO, UpdateAddressDTO } from '../models/address.js';
import logger from '../utils/logger.js';

interface UserAddresses {
  userId: string;
  addresses: Address[];
  updatedAt: Date;
}

class AddressService {
  private get collection() {
    return db.collection('userAddresses');
  }

  async createAddress(userId: string, dto: CreateAddressDTO): Promise<Address> {
    try {
      const doc = await this.collection.doc(userId).get();
      const now = new Date();

      const newAddress: Address = {
        id: Date.now().toString(), 
        userId,
        ...dto,
        isDefault: dto.isDefault || false,
        createdAt: now,
        updatedAt: now,
      };

      let addresses: Address[] = [];

      if (doc.exists) {
        const data = doc.data() as UserAddresses;
        addresses = data.addresses || [];

        if (newAddress.isDefault) {
          addresses = addresses.map(addr => ({ ...addr, isDefault: false }));
        }
      }

      addresses.push(newAddress);

      await this.collection.doc(userId).set({
        userId,
        addresses,
        updatedAt: now,
      });

      logger.info(`Address created for user ${userId}`);
      return newAddress;
    } catch (error) {
      logger.error('Error creating address:', error);
      throw error;
    }
  }

  async getAddresses(userId: string): Promise<Address[]> {
    try {
      const doc = await this.collection.doc(userId).get();

      if (!doc.exists) {
        return [];
      }

      const data = doc.data() as UserAddresses;
      const addresses = data.addresses || [];

      return addresses.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } catch (error) {
      logger.error('Error getting addresses:', error);
      throw error;
    }
  }

  async getAddress(addressId: string, userId: string): Promise<Address | null> {
    try {
      const addresses = await this.getAddresses(userId);
      return addresses.find(addr => addr.id === addressId) || null;
    } catch (error) {
      logger.error('Error getting address:', error);
      throw error;
    }
  }

  async updateAddress(addressId: string, userId: string, dto: UpdateAddressDTO): Promise<Address> {
    try {
      const doc = await this.collection.doc(userId).get();

      if (!doc.exists) {
        throw new Error('No addresses found');
      }

      const data = doc.data() as UserAddresses;
      let addresses = data.addresses || [];

      const index = addresses.findIndex(addr => addr.id === addressId);
      if (index === -1) {
        throw new Error('Address not found');
      }

      if (dto.isDefault) {
        addresses = addresses.map(addr => ({ ...addr, isDefault: false }));
      }

      addresses[index] = {
        ...addresses[index],
        ...dto,
        updatedAt: new Date(),
      };

      await this.collection.doc(userId).update({
        addresses,
        updatedAt: new Date(),
      });

      logger.info(`Address ${addressId} updated for user ${userId}`);
      return addresses[index];
    } catch (error) {
      logger.error('Error updating address:', error);
      throw error;
    }
  }

  async deleteAddress(addressId: string, userId: string): Promise<void> {
    try {
      const doc = await this.collection.doc(userId).get();

      if (!doc.exists) {
        throw new Error('No addresses found');
      }

      const data = doc.data() as UserAddresses;
      const addresses = (data.addresses || []).filter(addr => addr.id !== addressId);

      await this.collection.doc(userId).update({
        addresses,
        updatedAt: new Date(),
      });

      logger.info(`Address ${addressId} deleted for user ${userId}`);
    } catch (error) {
      logger.error('Error deleting address:', error);
      throw error;
    }
  }

  async setDefaultAddress(addressId: string, userId: string): Promise<Address> {
    try {
      const doc = await this.collection.doc(userId).get();

      if (!doc.exists) {
        throw new Error('No addresses found');
      }

      const data = doc.data() as UserAddresses;
      const addresses = (data.addresses || []).map(addr => ({
        ...addr,
        isDefault: addr.id === addressId,
        updatedAt: addr.id === addressId ? new Date() : addr.updatedAt,
      }));

      await this.collection.doc(userId).update({
        addresses,
        updatedAt: new Date(),
      });

      const updatedAddress = addresses.find(addr => addr.id === addressId);
      if (!updatedAddress) {
        throw new Error('Address not found');
      }

      logger.info(`Address ${addressId} set as default for user ${userId}`);
      return updatedAddress;
    } catch (error) {
      logger.error('Error setting default address:', error);
      throw error;
    }
  }
}

export default new AddressService();
