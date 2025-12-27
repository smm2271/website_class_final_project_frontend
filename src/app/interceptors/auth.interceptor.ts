import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { UserService } from '../services/user-service/user.service';

// 函式型攔截器
export const authInterceptor = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    const userService = inject(UserService);
    // 複製 request，加上 token header
    const token = userService.getToken();
    const authReq = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;
    return next(authReq).pipe(
        catchError(err => {
            if (err instanceof HttpErrorResponse && err.status === 401) {

                // 1. 如果是「登入」請求失敗，直接拋出錯誤，讓登入頁面顯示「帳密錯誤」
                if (req.url.includes('/api/user/login')) {
                    console.log('登入失敗：帳號或密碼錯誤');
                    return throwError(() => err);
                }
                // 2. 如果是「刷新 Token」本身失敗，代表連刷新權限都沒了，直接登出
                if (req.url.includes('/api/user/refresh-token')) {
                    console.log('Refresh Token 已過期，強制登出');
                    userService.logout();
                    return throwError(() => err);
                }
                // 3. 其他 API 請求失敗，嘗試刷新 Token
                console.log('Token 可能過期，嘗試刷新...');
                return userService.refreshTokenApi().pipe(
                    switchMap(() => {
                        const newToken = userService.getToken();
                        const retryReq = newToken
                            ? req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
                            : req;
                        return next(retryReq);
                    }),
                    catchError(innerErr => {
                        userService.logout();
                        return throwError(() => innerErr);
                    })
                );
            }
            return throwError(() => err);
        })
    );
};
