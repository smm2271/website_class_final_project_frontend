export type AuthMode = 'login' | 'register';

export function isAuthMode(value: any): value is AuthMode {
    return value === 'login' || value === 'register';
}
