export interface User {
    uid: string;          // Clerk User ID
    email: string;
    firstName?: string;
    lastName?: string;
    createdAt: string;
    updatedAt: string;
    role: 'user' | 'admin';
    preferences?: {
        language?: 'en' | 'kn' | 'tulu' | 'mixed';
    };
}

export interface CreateUserDTO {
    uid: string;
    email: string;
    firstName?: string;
    lastName?: string;
}
