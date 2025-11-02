import { Component } from '@angular/core';

@Component({
  selector: 'login-page',
  standalone: true,
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})

export class Login {
  user_name: string = "";
  password: string = "";
  submitLogin = () => {
    console.log(`User Name: ${this.user_name}, Password: ${this.password}`);
  }
}
