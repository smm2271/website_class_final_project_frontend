import { Component } from '@angular/core';
import { UserService, UserRegisterForm } from '../../../services/user-service/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'register-page',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './register.html',
    styleUrl: './register.scss',
})

export class Register {
    private readonly userService = inject(UserService);
    private readonly router = inject(Router);

    user_id: string = "";
    username: string = "";
    password: string = "";
    confirm_password: string = "";
    is_passwords_match: boolean = true;
    error_message: string = "";

    register() {
        this.is_passwords_match = this.password === this.confirm_password;
        if (!this.is_passwords_match) {
            this.error_message = "密碼與確認密碼不符";
            return;
        }
        const registerForm: UserRegisterForm = {
            user_id: this.user_id,
            username: this.username,
            password: this.password
        };

        this.userService.registerApi(registerForm).subscribe({
            next: (response) => {
                console.log('註冊成功:', response);
                this.router.navigate(['/home']);
            },
            error: (error) => {
                console.error('註冊失敗:', error);
                this.error_message = "註冊失敗，請稍後再試";
            }
        });
    }
}
