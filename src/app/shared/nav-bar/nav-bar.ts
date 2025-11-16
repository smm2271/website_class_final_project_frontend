import { Component } from '@angular/core';
import { RouterLink, RouterModule } from "@angular/router";
import { UserService } from '../../services/user.service';

@Component({
  selector: 'nav-bar',
  standalone: true,
  imports: [RouterLink, RouterModule],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})

export class NavBar {
  user_name: string = "";
  constructor(private userService: UserService) {
    if (this.userService.isAuthenticated()) {
      const user = this.userService.user();
      this.user_name = user ? user.username : "";
    }
  }
}
