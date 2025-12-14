import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService, UserLoginForm } from '../../services/user-service/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'login-page',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})


export class Login {
    user_name: string = "";
    password: string = "";
    errorMessage: string = "";


    private userService = inject(UserService);
    private router = inject(Router);

    login() {
        const loginForm: UserLoginForm = {
            user_id: this.user_name,
            password: this.password
        };

        this.userService.loginApi(loginForm).subscribe({
            next: (response) => {
                console.log('登入成功:', response);
                this.router.navigate(['/home']);
            },
            error: (error) => {
                if (error.status === 401) {
                    this.errorMessage = "帳號或密碼錯誤，請重新輸入。";
                } else {
                    this.errorMessage = "發生錯誤，請稍後再試。";
                }
            }
        });
    }
}
