import { Component, inject, signal, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterLink, RouterModule, Router } from "@angular/router";
import { UserService } from '../../services/user-service/user.service';

@Component({
    selector: 'nav-bar',
    standalone: true,
    imports: [RouterLink, RouterModule],
    templateUrl: './nav-bar.html',
    styleUrl: './nav-bar.scss',
})

export class NavBar {
    protected userService = inject(UserService);
    router = inject(Router);
    // 使用 signal 來追蹤登出按鈕的顯示狀態
    showLogoutButton = signal(false);

    @ViewChild('userContainer') userContainer!: ElementRef;

    @HostListener('document:click', ['$event'])
    onClick(event: MouseEvent) {
        if (this.showLogoutButton() && this.userContainer && !this.userContainer.nativeElement.contains(event.target)) {
            this.showLogoutButton.set(false);
        }
    }

    // 將參數類型改為 Event，這樣就能同時相容滑鼠點擊與鍵盤按下 Enter
    changeShowLogoutButtonStatus(event: Event) {
        // 關鍵：阻止事件冒泡，避免觸發 document:click 導致立刻關閉
        event.stopPropagation();

        // 切換顯示狀態
        this.showLogoutButton.set(!this.showLogoutButton());
        console.log('登出按鈕狀態:', this.showLogoutButton());
    }

    startChat() {
        this.router.navigate(['/chat']);
        this.showLogoutButton.set(false);
    }

    logout() {
        console.log('執行登出');
        this.userService.logoutApi().subscribe({
            next: () => {
                console.log('登出成功');
                this.showLogoutButton.set(false);
            },
            error: (error) => {
                console.error('登出失敗:', error);
            }
        });
    }
}
