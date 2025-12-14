import { Component, signal } from '@angular/core';
import { Sidebar } from './chat-sidebar/sidebar';
import { MessageView } from './message-view/message-view';

@Component({
    selector: 'app-chat-page',
    imports: [Sidebar, MessageView],
    templateUrl: './chat-page.html',
    styleUrls: ['./chat-page.scss'],  // 注意：styleUrls
})
export class Chat {
    isChatOpen = signal(true);
    selectedRoom = signal<{ id: string; name: { id: string; name: string } } | null>(null);

    onChatSelected(room: { id: string; name: { id: string; name: string } }) {
        this.selectedRoom.set(room);
        this.isChatOpen.set(true);
    }

    onBackToList() {
        this.isChatOpen.set(false);
    }
}
