import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { UserService } from '../user-service/user.service';

export interface WSMessage {
    message_id: string;
    user_id: string;
    chatroom_id: string;
    content: string;
    timestamp: string;
}

@Injectable({
    providedIn: 'root'
})
export class ChatMessageService {
    private ws: WebSocket | null = null;

    // WS 訊息 queue
    private messageQueue: any[] = [];

    // Observable：給前端接收訊息
    public incomingMessages$ = new Subject<WSMessage>();

    // 連線狀態
    public connected$ = new BehaviorSubject<boolean>(false);

    constructor(private userService: UserService) { }

    /** WebSocket 連線 */
    connect(): void {
        if (this.ws) return;

        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        this.ws = new WebSocket(`${wsProtocol}://${window.location.host}/online`);

        this.ws.onopen = () => {
            this.connected$.next(true);
            console.log('WS connected');

            // 發送 queue 中訊息
            while (this.messageQueue.length > 0) {
                const data = this.messageQueue.shift();
                this.ws!.send(JSON.stringify(data));
            }
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.incomingMessages$.next(data);
            } catch (err) {
                console.error('Message parse error', err);
            }
        };

        this.ws.onclose = (e) => {
            console.warn('WS closed:', e.code);
            this.connected$.next(false);
            this.ws = null;
        };

        this.ws.onerror = (e) => {
            console.error('WS error:', e);
        };
    }

    disconnect(): void {
        if (!this.ws) return;
        this.send({ action_type: 'disconnect' });
        this.ws.close();
        this.ws = null;
    }

    private send(data: any): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('WS not open, message queued:', data);
            this.messageQueue.push(data);
            return;
        }
        this.ws.send(JSON.stringify(data));
    }

    joinRoom(roomId: string): void {
        this.send({ action_type: 'join_room', chatroom_id: roomId });
    }

    leaveRoom(roomId: string): void {
        this.send({ action_type: 'leave_room', chatroom_id: roomId });
    }

    sendMessage(roomId: string, content: string): void {
        this.send({ action_type: 'send_message', chatroom_id: roomId, content });
    }

    markRead(messageId: string): void {
        this.send({ action_type: 'mark_read', message_id: messageId });
    }

    /** HTTP - 建立房間 */
    createRoom(roomName: string): Promise<void> {
        const payload = { room_name: roomName };
        return fetch('/message/create_room', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then(r => r.json())
            .then(data => {
                console.log('Room created:', data);
            })
            .catch(err => {
                console.error('Error creating room:', err);
                throw err;
            });
    }

    /** HTTP - 取得房間列表 */
    getRooms(): Promise<any[]> {
        return fetch('/message/get_rooms', {
            method: 'GET',
            credentials: 'include'
        })
            .then(r => r.json())
            .then(data => {
                if (data && data.room_ids) {
                    // 將物件轉成陣列 [{id, name}, ...]
                    return Object.entries(data.room_ids).map(([id, roomData]) => ({
                        id,
                        name: roomData
                    }));
                }
                return []; // 沒有房間就回空陣列
            })
            .catch(err => {
                console.error('Error getting rooms:', err);
                return [];
            });
    }
}
