import { db } from '../config/firebase.js';
import { Address, CreateAddressDTO, UpdateAddressDTO } from '../models/address.js';
import logger from '../utils/logger.js';

class AddressService {
  private get collection() {
    return db.collection('addresses');
  }

  async createAddress(userId: string, dto: CreateAddressDTO): Promise<Address> {
    try {
      const now = new Date();

      // If this is set as default, unset other defaults
      if (dto.isDefault) {
        await this.unsetDefaultAddresses(userId);
      }

      const addressData = {
        userId,
        ...dto,
        isDefault: dto.isDefault || false,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await this.collection.add(addressData);
      
      return {
        id: docRef.id,
        ...addressData,
      };
    } catch (error) {
      logger.error('Error creating address:', error);
      throw error;
    }
  }

  async getAddresses(userId: string): Promise<Address[]> {
    try {
      const snapshot = await this.collection
        .where('userId', '==', userId)
        .orderBy('isDefault', 'desc')
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      }));
    } catch (error) {
      logger.error('Error getting addresses:', error);
      throw error;
    }
  }

  async getAddress(addressId: string, userId: string): Promise<Address | null> {
    try {
      const doc = await this.collection.doc(addressId).get();
      
      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      
      // Verify ownership
      if (data?.userId !== userId) {
        throw new Error('Unauthorized access to address');
      }

      return {
        id: doc.id,
        ...data,
        createdAt: data?.createdAt?.toDate(),
        updatedAt: data?.updatedAt?.toDate(),
      } as Address;
    } catch (error) {
      logger.error('Error getting address:', error);
      throw error;
    }
  }

  async updateAddress(addressId: string, userId: string, dto: UpdateAddressDTO): Promise<Address> {
    try {
      const address = await this.getAddress(addressId, userId);
      
      if (!address) {
        throw new Error('Address not found');
      }

      // If setting as default, unset other defaults
      if (dto.isDefault) {
        await this.unsetDefaultAddresses(userId);
      }

      const updateData = {
        ...dto,
        updatedAt: new Date(),
      };

      await this.collection.doc(addressId).update(updateData);

      return {
        ...address,
        ...updateData,
      };
    } catch (error) {
      logger.error('Error updating address:', error);
      throw error;
    }
  }

  async deleteAddress(addressId: string, userId: string): Promise<void> {
    try {
      const address = await this.getAddress(addressId, userId);
      
      if (!address) {
        throw new Error('Address not found');
      }

      await this.collection.doc(addressId).delete();
      logger.info(`Address ${addressId} deleted`);
    } catch (error) {
      logger.error('Error deleting address:', error);
      throw error;
    }
  }

  async setDefaultAddress(addressId: string, userId: string): Promise<Address> {
    try {
      // Unset all defaults
      await this.unsetDefaultAddresses(userId);

      // Set this one as default
      await this.collection.doc(addressId).update({
        isDefault: true,
        updatedAt: new Date(),
      });

      const address = await this.getAddress(addressId, userId);
      
      if (!address) {
        throw new Error('Address not found');
      }

      return address;
    } catch (error) {
      logger.error('Error setting default address:', error);
      throw error;
    }
  }

  private async unsetDefaultAddresses(userId: string): Promise<void> {
    try {
      const snapshot = await this.collection
        .where('userId', '==', userId)
        .where('isDefault', '==', true)
        .get();

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { isDefault: false });
      });

      await batch.commit();
    } catch (error) {
      logger.error('Error unsetting default addresses:', error);
      throw error;
    }
  }
}

export default new AddressService();
