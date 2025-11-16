import { Component } from '@angular/core';
import { UserService, UserRegisterForm } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'register-page',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './register.html',
	styleUrl: './register.scss',
})

export class Register {
	constructor(private userService: UserService) { }
	user_id: string = "";
	username: string = "";
	password: string = "";
	confirm_password: string = "";
	is_passwords_match: boolean = true;

	register() {
		this.is_passwords_match = this.password === this.confirm_password;
		if (!this.is_passwords_match) {
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
				// 可以在這裡導向登入頁面或其他操作
			},
			error: (error) => {
				console.error('註冊失敗:', error);
				// 顯示錯誤訊息
			}
		});
	}
} 