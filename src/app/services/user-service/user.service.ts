import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { User, AuthState } from '../../models/user-model/user.model';
import { Router } from '@angular/router';

// API 請求和響應介面
export interface UserLoginForm {
    user_id: string;
    password: string;
}

export interface UserRegisterForm {
    user_id: string;
    username: string;
    password: string;
}

export interface UserResponseModel {
    id: string;
    user_id: string;
    username: string;
}

@Injectable({
    providedIn: 'root'
})

export class UserService {
    private router = inject(Router);
    private http = inject(HttpClient);
    private apiUrl = '/user'; // 根據後端 API 路徑調整

    // 使用 signal 來管理用戶狀態
    private authState = signal<AuthState>({
        user: null,
        isAuthenticated: false,
        token: null
    });

    // 公開的只讀 signals
    user = computed(() => this.authState().user);
    isAuthenticated = computed(() => this.authState().isAuthenticated);
    token = computed(() => this.authState().token);

    constructor() {
        // 從 localStorage 恢復用戶狀態
        this.loadUserFromStorage();
    }

    /**
     * 設置用戶登入狀態
     */
    login(user: User, token?: string | null): void {
        const newState: AuthState = {
            user,
            isAuthenticated: true,
            token: token ?? null
        };

        this.authState.set(newState);
        this.saveUserToStorage(newState);
    }

    /**
     * 登出用戶
     */
    logout(): void {
        this.authState.set({
            user: null,
            isAuthenticated: false,
            token: null
        });

        this.clearUserFromStorage();
        this.router.navigate(['/login']);
    }

    /**
     * 更新用戶資訊
     */
    updateUser(userData: Partial<User>): void {
        const currentState = this.authState();
        if (currentState.user) {
            const updatedUser = { ...currentState.user, ...userData };
            const newState: AuthState = {
                ...currentState,
                user: updatedUser
            };

            this.authState.set(newState);
            this.saveUserToStorage(newState);
        }
    }

    /**
     * 更新 token
     */
    updateToken(token: string): void {
        const currentState = this.authState();
        const newState: AuthState = {
            ...currentState,
            token
        };

        this.authState.set(newState);
        this.saveUserToStorage(newState);
    }

    /**
     * 從 localStorage 載入用戶資料
     */
    private loadUserFromStorage(): void {
        try {
            const storedState = localStorage.getItem('authState');
            if (storedState) {
                const parsedState = JSON.parse(storedState) as AuthState;
                // 如果此前標記為已驗證 (cookie-based 情況下 token 可能為 null)，則恢復狀態
                if (parsedState.isAuthenticated) {
                    this.authState.set(parsedState);
                }
            }
        } catch (error) {
            console.error('載入用戶狀態失敗:', error);
            this.clearUserFromStorage();
        }
    }

    /**
     * 儲存用戶資料到 localStorage
     */
    private saveUserToStorage(state: AuthState): void {
        try {
            localStorage.setItem('authState', JSON.stringify(state));
        } catch (error) {
            console.error('儲存用戶狀態失敗:', error);
        }
    }

    /**
     * 清除 localStorage 中的用戶資料
     */
    private clearUserFromStorage(): void {
        try {
            localStorage.removeItem('authState');
        } catch (error) {
            console.error('清除用戶狀態失敗:', error);
        }
    }

    /**
     * 檢查 token 是否存在
     */
    hasToken(): boolean {
        return !!this.token();
    }

    /**
     * 獲取 token
     */

    getToken(): string | null {
        {
            if (!this.hasToken()) {
                return null;
            }
            return this.token();
        }
    }

    /**
     * 獲取用戶 ID
     */
    getUserId(): string | null {
        return this.user()?.id ?? null;
    }

    /**
     * 獲取用戶名稱
     */
    getUsername(): string | null {
        return this.user()?.username ?? null;
    }

    /**
     * 獲取用戶全名
     */
    getFullName(): string | null {
        const currentUser = this.user();
        if (!currentUser) return null;

        const { firstName, lastName } = currentUser;
        if (firstName && lastName) {
            return `${firstName} ${lastName}`;
        }
        return firstName || lastName || currentUser.username;
    }

    // ===== API 方法 =====

    /**
     * 登入用戶（調用後端 API）
     */
    loginApi(loginForm: UserLoginForm): Observable<UserResponseModel> {
        return this.http.post<UserResponseModel>(
            `${this.apiUrl}/login`,
            loginForm,
            {
                withCredentials: true,
                observe: 'body',
                responseType: 'json'
            }
        ).pipe(
            tap(response => {
                console.log('登入響應:', response);
                // 將後端響應轉換為 User 格式並更新狀態
                const user: User = {
                    id: response.id,
                    username: response.username,
                    email: response.user_id // 使用 user_id 作為 email 欄位
                };
                // 注意：token 通過 HttpOnly cookie 管理，前端無法讀取 token
                // 只更新已驗證的用戶狀態，不設定假的 bearer token
                this.login(user, null);
            }),
            catchError(error => {
                console.error('登入失敗詳情:', {
                    status: error.status,
                    statusText: error.statusText,
                    message: error.message,
                    error: error.error
                });
                return throwError(() => error);
            })
        );
    }

    /**
     * 登出用戶（調用後端 API）
     */
    logoutApi(): Observable<any> {
        return this.http.post(
            `${this.apiUrl}/logout`,
            {},
            { withCredentials: true }
        ).pipe(
            tap(() => {
                // 清除本地狀態
                this.logout();
            }),
            catchError(error => {
                console.error('登出失敗:', error);
                // 即使 API 失敗也清除本地狀態
                this.logout();
                return throwError(() => error);
            })
        );
    }

    /**
     * 註冊新用戶（調用後端 API）
     */
    registerApi(registerForm: UserRegisterForm): Observable<UserResponseModel> {
        return this.http.post<UserResponseModel>(
            `${this.apiUrl}/register`,
            registerForm,
            {
                withCredentials: true,
                observe: 'body',
                responseType: 'json'
            }
        ).pipe(
            tap(response => {
                console.log('註冊響應:', response);
                // 註冊成功後自動登入
                const user: User = {
                    id: response.id,
                    username: response.username,
                    email: response.user_id
                };
                this.login(user, null);
            }),
            catchError(error => {
                console.error('註冊失敗詳情:', {
                    status: error.status,
                    statusText: error.statusText,
                    message: error.message,
                    error: error.error
                });
                return throwError(() => error);
            })
        );
    }    /**
     * 刷新 token（調用後端 API）
     */
    refreshTokenApi(): Observable<any> {
        return this.http.post(
            `${this.apiUrl}/refresh-token`,
            {},
            { withCredentials: true }
        ).pipe(
            tap(() => {
                console.log('Token 刷新成功');
            }),
            catchError(error => {
                console.error('Token 刷新失敗:', error);
                // Token 刷新失敗時登出用戶
                this.logout();
                return throwError(() => error);
            })
        );
    }

    /**
     * 設置 API 基礎 URL（可選）
     */
    setApiUrl(url: string): void {
        this.apiUrl = url;
    }
}
