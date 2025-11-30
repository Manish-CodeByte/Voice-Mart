import { db } from '../config/firebase.js';
import { User, CreateUserDTO } from '../models/user.js';
import logger from '../utils/logger.js';

export class UserService {
    private get collection() {
        if (typeof db.collection !== 'function') {
            throw new Error('Firestore not initialized. Check FIREBASE_SERVICE_ACCOUNT in .env');
        }
        return db.collection('users');
    }

    async getUser(uid: string): Promise<User | null> {
        try {
            const doc = await this.collection.doc(uid).get();
            if (doc.exists) {
                return doc.data() as User;
            }
            return null;
        } catch (error) {
            logger.error(`Error fetching user ${uid}:`, error);
            throw error;
        }
    }

    async createUser(data: CreateUserDTO): Promise<User> {
        try {
            const now = new Date().toISOString();
            const newUser: User = {
                uid: data.uid,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                role: 'user',
                createdAt: now,
                updatedAt: now,
                preferences: {
                    language: 'en' // Default
                }
            };

            await this.collection.doc(data.uid).set(newUser);
            logger.info(`User created in Firestore: ${data.uid}`);
            return newUser;
        } catch (error) {
            logger.error(`Error creating user ${data.uid}:`, error);
            throw error;
        }
    }

    async syncUser(data: CreateUserDTO): Promise<User> {
        const existing = await this.getUser(data.uid);
        if (existing) {
            // Update last login or other fields if needed
            return existing;
        }
        return this.createUser(data);
    }
}

export const userService = new UserService();
