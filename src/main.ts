import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth.interceptor'; // 你之後要建立的檔案
import { appConfig } from './app/app.config';

bootstrapApplication(App, {
    ...appConfig,
    providers: [
        provideHttpClient(
            withInterceptors([authInterceptor]) // 註冊攔截器
        ),
        // 如果 appConfig 裡也有 providers，記得展開
        ...(appConfig.providers || [])
    ]
})
    .catch(err => console.error(err));
