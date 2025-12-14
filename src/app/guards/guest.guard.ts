import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserService } from '../services/user-service/user.service';

/**
 * 訪客守衛 - 只允許未登入的用戶訪問
 * 用於登入和註冊頁面，防止已登入用戶重複訪問
 */
export const guestGuard: CanActivateFn = (route, state) => {
    const userService = inject(UserService);
    const router = inject(Router);

    // 如果用戶未登入，允許訪問
    if (!userService.isAuthenticated()) {
        return true;
    }

    // 如果用戶已登入，重定向到首頁
    console.log('用戶已登入，重定向到聊天頁面');
    router.navigate(['/chat']);
    return false;
};
