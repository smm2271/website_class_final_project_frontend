import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserService } from '../services/user-service/user.service';

/**
 * 認證守衛 - 只允許已登入的用戶訪問
 * 用於需要登入才能訪問的頁面
 */
export const authGuard: CanActivateFn = (route, state) => {
    const userService = inject(UserService);
    const router = inject(Router);

    // 如果用戶已登入，允許訪問
    if (userService.isAuthenticated()) {
        return true;
    }

    // 如果用戶未登入，重定向到登入頁面
    console.log('用戶未登入，重定向到登入頁');
    router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
    });
    return false;
};
