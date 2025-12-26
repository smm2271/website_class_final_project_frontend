import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthMode, isAuthMode } from './auth-mode';
import { Login } from './login/login';
import { Register } from './register/register';
import { Footer } from '../../shared/footer/footer';

@Component({
    standalone: true,
    selector: 'app-auth',
    templateUrl: './auth-page.html',
    styleUrl: './auth-page.scss',
    imports: [Login, Register, Footer]
})

export class AuthPage {
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    private queryParams = toSignal(this.route.queryParamMap);
    mode = computed(() => {
        const mode = this.queryParams()?.get('mode');
        return isAuthMode(mode) ? mode : 'login';
    });

    switchMode(mode: AuthMode) {
        this.router.navigate([], {
            queryParams: { mode },
            queryParamsHandling: 'merge',
        });
    }
}
