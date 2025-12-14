import { Component, effect, EventEmitter, Input, Output, Signal, signal } from '@angular/core';
import { ChatMessageService } from '../../../services/message-service/message.service';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'app-message-view',
    imports: [FormsModule],
    standalone: true,
    templateUrl: './message-view.html',
    styleUrl: './message-view.scss',
})
export class MessageView {
    @Input() selectedRoom: Signal<{ id: string; name: any } | null> = signal(null);
    @Output() backToList = new EventEmitter<void>();
    newMessage = signal('');
    sendMessage() {
        const room = this.selectedRoom();
        if (room) {
            this.chatMessageService.sendMessage(room.id, this.newMessage());
            this.newMessage.set('');
        }
    }

    messageList: any[] = []; // 儲存訊息列表
    constructor(private chatMessageService: ChatMessageService) {
        chatMessageService.connect();
        chatMessageService.incomingMessages$.subscribe((msg) => {
            // 只處理屬於目前選中聊天室的訊息
            const currentRoom = this.selectedRoom();
            if (currentRoom && msg.chatroom_id === currentRoom.id) {
                this.messageList.push(msg);
            }
        });
        effect(() => {
            console.log("Selected room changed:", this.selectedRoom());
        });
    }
    // 在手機版 Header 增加一個「返回」按鈕，點擊時呼叫此方法
    goBack() {
        this.backToList.emit();
    }
}
