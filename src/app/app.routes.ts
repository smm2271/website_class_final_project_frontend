import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'login',
        component: Login,
        canActivate: [guestGuard] // 已登入用戶無法訪問
    },
    {
        path: 'register',
        component: Register,
        canActivate: [guestGuard] // 已登入用戶無法訪問
    },
    {
        path: '**',
        component: Home
    }
];
