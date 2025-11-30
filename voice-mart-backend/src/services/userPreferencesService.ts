import { db } from '../config/firebase.js';
import logger from '../utils/logger.js';

interface UserPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
}

class UserPreferencesService {
  private get collection() {
    if (!db || typeof db.collection !== 'function') {
      throw new Error('Firestore is not initialized');
    }
    return db.collection('userPreferences');
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    try {
      const doc = await this.collection.doc(userId).get();
      
      if (!doc.exists) {
        // Return defaults
        return {
          orderUpdates: true,
          promotions: false,
          newsletter: true,
        };
      }

      const data = doc.data();
      return {
        orderUpdates: data?.orderUpdates ?? true,
        promotions: data?.promotions ?? false,
        newsletter: data?.newsletter ?? true,
      };
    } catch (error) {
      logger.error(`Error getting preferences for user ${userId}:`, error);
      throw error;
    }
  }

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const current = await this.getPreferences(userId);
      const updated = { ...current, ...preferences };

      await this.collection.doc(userId).set(updated, { merge: true });

      logger.info(`Updated preferences for user ${userId}`);
      return updated;
    } catch (error) {
      logger.error(`Error updating preferences for user ${userId}:`, error);
      throw error;
    }
  }
}

export default new UserPreferencesService();
