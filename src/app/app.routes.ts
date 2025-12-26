import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Chat } from './pages/chat-page/chat-page';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'signin',
        loadComponent: () =>
            import('./pages/auth-page/auth-page').then(m => m.AuthPage)
    },
    {
        path: 'chat',
        component: Chat,
        canActivate: [authGuard] // 未登入用戶無法訪問
    },
    {
        path: '**',
        component: Home
    }
];
