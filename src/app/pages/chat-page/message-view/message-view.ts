import { Component, effect, EventEmitter, Input, Output, Signal, signal, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { ChatMessageService, WSMessage, NewMessageNotification, MessageListNotification, Room } from '../../../services/message-service/message.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user-service/user.service';

@Component({
    selector: 'app-message-view',
    imports: [FormsModule, CommonModule],
    standalone: true,
    templateUrl: './message-view.html',
    styleUrls: ['./message-view.scss'],
})
export class MessageView implements AfterViewChecked {
    @Input() selectedRoom: Signal<Room | null> = signal(null);
    @Output() backToList = new EventEmitter<void>();

    newMessage = signal('');
    historyMessageList = signal<WSMessage[]>([]);

    // 參考訊息區 div，用於滾動
    @ViewChild('messageContainer') messageContainer!: ElementRef<HTMLDivElement>;

    constructor(
        private chatMessageService: ChatMessageService,
        public userService: UserService
    ) {
        chatMessageService.connect();

        // 監聽聊天室切換
        effect(() => {
            const room = this.selectedRoom();
            if (!room) return;

            // 清空訊息列表並拉取歷史訊息
            this.historyMessageList.set([]);
            this.chatMessageService.getMessages(room.id, 50);
        });

        // 訂閱歷史訊息
        this.chatMessageService.messageList$.subscribe((msgList) => {
            const room = this.selectedRoom();
            if (!room || msgList.chatroom_id !== room.id) return;

            // 過濾已存在訊息，避免覆蓋
            const existingIds = new Set(this.historyMessageList().map(m => m.id));
            const newMessages = msgList.messages
                .map(m => ({ ...m, created_at: this.fixDate(m.created_at) }))
                .filter(m => !existingIds.has(m.id));

            if (newMessages.length > 0) {
                // 反轉歷史訊息（最舊在上）
                const reversed = [...newMessages].reverse();
                this.historyMessageList.update(list => [...list, ...reversed]);
            }
        });

        // 訂閱即時新訊息
        this.chatMessageService.newMessage$.subscribe((msg) => {
            const room = this.selectedRoom();
            if (!room || msg.chatroom_id !== room.id) return;

            const wsMsg: WSMessage = {
                id: msg.id,
                author_id: msg.author_id,
                author_name: msg.author_name,
                content: msg.content,
                created_at: this.fixDate(msg.created_at),
                is_read: msg.is_read,
                chatroom_id: msg.chatroom_id,
            };

            this.historyMessageList.update(list => [...list, wsMsg]);
        });
    }

    sendMessage() {
        const content = this.newMessage().trim();
        if (!content) return;

        const room = this.selectedRoom();
        if (room) {
            this.chatMessageService.sendMessage(room.id, content);
            this.newMessage.set('');
        }
    }

    goBack() {
        this.backToList.emit();
    }

    showChatID() {
        alert(this.selectedRoom()?.id);
    }

    private fixDate(dateStr: string): string {
        if (!dateStr) return dateStr;
        // 如果格式是 "2023-12-20 10:00:00"，將空格換成 "T"
        let fixed = dateStr.replace(' ', 'T');
        // 如果結尾沒有 Z 且沒有 + 時區資訊，強制補上 Z 代表它是 UTC 時間
        if (!fixed.includes('Z') && !fixed.includes('+')) {
            fixed += 'Z';
        }
        return fixed;
    }

    // 監聽訊息列表更新，自動滾動到底
    ngAfterViewChecked() {
        if (this.messageContainer) {
            this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
        }
    }
}
