export interface User {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    createdAt?: Date;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null;
}
