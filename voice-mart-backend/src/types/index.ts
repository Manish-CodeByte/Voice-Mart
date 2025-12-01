// Custom type definitions for the Voice Mart backend

export interface User {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthTokenPayload {
    userId: string;
    email: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
}

import 'multer'; // Ensure multer types are loaded

export interface VoiceTranscriptionRequest {
    audioFile: Express.Multer.File;
    language?: string;
}

export interface VoiceTranscriptionResponse {
    text: string;
    confidence?: number;
    language?: string;
}

export interface ProductSearchQuery {
    query: string;
    category?: string;
    priceRange?: {
        min: number;
        max: number;
    };
    limit?: number;
}

// Extend Express Request type to include user info
declare global {
    namespace Express {
        interface Request {
            user?: AuthTokenPayload;
        }
    }
}
