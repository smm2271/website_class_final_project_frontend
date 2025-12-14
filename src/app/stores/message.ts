import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ChatMessage {
    message_id: string;
    chatroom_id: string;
    user_id: string;
    content: string;
    timestamp: string;
}

@Injectable({
    providedIn: 'root'
})
export class MessageStoreService {

    private messagesMap = new Map<string, ChatMessage[]>();
    private messages$ = new BehaviorSubject<Map<string, ChatMessage[]>>(this.messagesMap);

    get messagesObservable() {
        return this.messages$.asObservable();
    }

    addMessage(msg: ChatMessage) {
        const roomId = msg.chatroom_id;

        if (!this.messagesMap.has(roomId)) {
            this.messagesMap.set(roomId, []);
        }

        this.messagesMap.get(roomId)!.push(msg);
        this.messages$.next(this.messagesMap);
    }

    getMessages(roomId: string) {
        return this.messagesMap.get(roomId) || [];
    }
}
