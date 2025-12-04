import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger.js';

dotenv.config();

try {
  let serviceAccount;
  const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    logger.info('🔑 Loaded Firebase credentials from service-account.json');
  } 
  else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    logger.info('🔑 Loaded Firebase credentials from environment variable');
  }

  if (serviceAccount) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      logger.info('🔥 Firebase Admin initialized successfully');
    }
  } else {
    logger.warn('⚠️ No Firebase credentials found (service-account.json or env). Firestore will fail if used.');
  }
} catch (error) {
  logger.error('❌ Failed to initialize Firebase Admin:', error);
}

export const db: admin.firestore.Firestore = admin.apps.length ? admin.firestore() : {} as admin.firestore.Firestore;
if (admin.apps.length) {
  db.settings({ ignoreUndefinedProperties: true });
}
export const auth: admin.auth.Auth = admin.apps.length ? admin.auth() : {} as admin.auth.Auth;
