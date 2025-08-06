export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    address: string;
    phoneNumber: string;
    direction: string;
    role: 'admin' | 'user';
    isActive: boolean;
    phoneVerified: boolean;
    phoneVerificationCode?: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}