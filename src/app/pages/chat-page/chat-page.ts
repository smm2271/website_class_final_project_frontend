import { Component, signal } from '@angular/core';
import { Sidebar } from './chat-sidebar/sidebar';
import { MessageView } from './message-view/message-view';
import { Room } from '../../services/message-service/message.service';

@Component({
    selector: 'app-chat-page',
    imports: [Sidebar, MessageView],
    templateUrl: './chat-page.html',
    styleUrls: ['./chat-page.scss'],  // 注意：styleUrls
})
export class Chat {
    isChatOpen = signal(false);
    selectedRoom = signal<Room | null>(null);

    onChatSelected(room: Room) {
        this.selectedRoom.set(room);
        this.isChatOpen.set(true);
    }

    onBackToList() {
        this.isChatOpen.set(false);
        this.selectedRoom.set(null);
    }
}
