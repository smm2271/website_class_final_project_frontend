import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, switchMap, filter, take, throwError, catchError, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, AuthState } from '../../models/user-model/user.model';

export interface UserLoginForm { user_id: string; password: string; }
export interface UserRegisterForm { user_id: string; username: string; password: string; }
export interface UserResponseModel { id: string; user_id: string; username: string; }

@Injectable({ providedIn: 'root' })
export class UserService {
    private readonly router = inject(Router);
    private readonly http = inject(HttpClient);
    private readonly apiUrl = '/api/user';

    private readonly authState = signal<AuthState>({ user: null, isAuthenticated: false, token: null });
    user = computed(() => this.authState().user);
    isAuthenticated = computed(() => this.authState().isAuthenticated);
    token = computed(() => this.authState().token);

    // token 刷新控制
    private readonly refreshTokenSubject = new BehaviorSubject<boolean>(false);
    private refreshTokenInProgress = false;

    constructor() { this.loadUserFromStorage(); }

    // ===== 狀態操作 =====
    login(user: User, token?: string | null): void {
        const newState: AuthState = { user, isAuthenticated: true, token: token ?? null };
        this.authState.set(newState);
        this.saveUserToStorage(newState);
    }

    logout(): void {
        this.authState.set({ user: null, isAuthenticated: false, token: null });
        this.clearUserFromStorage();
        this.router.navigate(['/login']);
    }

    updateUser(userData: Partial<User>): void {
        const currentState = this.authState();
        if (!currentState.user) return;
        this.authState.set({ ...currentState, user: { ...currentState.user, ...userData } });
        this.saveUserToStorage(this.authState());
    }

    hasToken(): boolean { return !!this.token(); }
    getToken(): string | null { return this.token(); }

    // ===== LocalStorage =====
    private loadUserFromStorage(): void {
        try {
            const stored = localStorage.getItem('authState');
            if (!stored) return;
            const parsed = JSON.parse(stored) as AuthState;
            if (parsed.isAuthenticated) this.authState.set(parsed);
        } catch { this.clearUserFromStorage(); }
    }
    private saveUserToStorage(state: AuthState): void {
        try { localStorage.setItem('authState', JSON.stringify(state)); } catch { }
    }
    private clearUserFromStorage(): void { localStorage.removeItem('authState'); }

    // ===== API 方法 =====
    loginApi(form: UserLoginForm): Observable<UserResponseModel> {
        return this.http.post<UserResponseModel>(`${this.apiUrl}/login`, form, { withCredentials: true }).pipe(
            tap(res => this.login({ id: res.id, username: res.username, email: res.user_id }, null)),
            catchError(err => throwError(() => err))
        );
    }

    logoutApi(): Observable<any> {
        return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
            tap(() => this.logout()),
            catchError(err => { this.logout(); return throwError(() => err); })
        );
    }

    refreshTokenApi(): Observable<any> {
        return this.http.post(`${this.apiUrl}/refresh-token`, {}, { withCredentials: true }).pipe(
            tap(() => console.log('Token 刷新成功')),
            catchError(err => { this.logout(); return throwError(() => err); })
        );
    }

    refreshTokenApiShared(): Observable<any> {
        if (this.refreshTokenInProgress) {
            return this.refreshTokenSubject.pipe(filter(done => done === true), take(1));
        } else {
            this.refreshTokenInProgress = true;
            this.refreshTokenSubject.next(false);
            return this.refreshTokenApi().pipe(
                switchMap(result => {
                    this.refreshTokenInProgress = false;
                    this.refreshTokenSubject.next(true);
                    return of(result);
                }),
                catchError(err => {
                    this.refreshTokenInProgress = false;
                    this.refreshTokenSubject.next(true);
                    this.logout();
                    return throwError(() => err);
                })
            );
        }
    }

    registerApi(form: UserRegisterForm): Observable<UserResponseModel> {
        return this.http.post<UserResponseModel>(`${this.apiUrl}/register`, form, { withCredentials: true }).pipe(
            tap(res => this.login({ id: res.id, username: res.username, email: res.user_id }, null)),
            catchError(err => throwError(() => err))
        );
    }
}
