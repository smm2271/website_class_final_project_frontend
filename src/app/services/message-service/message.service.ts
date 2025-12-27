import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Subject, lastValueFrom } from 'rxjs';

export interface WSMessage {
    id: string;
    author_id: string;
    author_name?: string;
    content: string;
    created_at: string;
    is_read: boolean;
    chatroom_id?: string;
}

export interface NewMessageNotification extends WSMessage {
    type: string;
    chatroom_id: string;
}

export interface MessageListNotification {
    type: string;
    chatroom_id: string;
    messages: WSMessage[];
}

export interface Room {
    id: string;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class ChatMessageService {
    private ws: WebSocket | null = null;
    private readonly messageQueue: any[] = [];

    public readonly newMessage$ = new Subject<NewMessageNotification>();
    public readonly messageList$ = new Subject<MessageListNotification>();
    public readonly connected$ = new BehaviorSubject<boolean>(false);

    base_url = '/api/message';

    private http = inject(HttpClient);

    constructor() { }

    /** ---------------- WebSocket ---------------- */
    connect(): void {
        if (this.ws) return;

        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        this.ws = new WebSocket(`${wsProtocol}://${window.location.host}${this.base_url}/online`);

        this.ws.onopen = () => {
            this.connected$.next(true);
            while (this.messageQueue.length > 0) {
                this.ws!.send(JSON.stringify(this.messageQueue.shift()));
            }
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'new_message') {
                    this.newMessage$.next(data);
                } else if (data.type === 'message_list') {
                    // 前端可自行處理完整訊息列表
                    console.log('Received messages', data);
                    this.messageList$.next(data);
                }
            } catch (err) {
                console.error('Message parse error', err);
            }
        };

        this.ws.onclose = () => {
            this.connected$.next(false);
            this.ws = null;
        };

        this.ws.onerror = (e) => console.error('WS error', e);
    }

    disconnect(): void {
        if (!this.ws) return;
        this.send({ action_type: 'disconnect' });
        this.ws.close();
        this.ws = null;
    }

    private send(data: any): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
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

    getMessages(roomId: string, limit: number = 50, before?: string): void {
        const data: any = { action_type: 'get_message', chatroom_id: roomId, limit };
        if (before) data.before_created_at = before;
        this.send(data);
    }

    markRoomRead(roomId: string): void {
        this.send({ action_type: 'mark_room_read', chatroom_id: roomId });
    }

    /** ---------------- HTTP API ---------------- */
    createRoom(roomName?: string): Promise<Room> {
        const payload = { room_name: roomName };
        return lastValueFrom(
            this.http.post<any>(`${this.base_url}/create_room`, payload, { withCredentials: true })
        ).then(data => ({
            id: data.room_id,
            name: roomName || `room_${data.room_id}`
        })).catch(err => {
            console.error('Error creating room', err);
            throw err;
        });
    }

    getRooms(): Promise<Room[]> {
        return lastValueFrom(
            this.http.get<any>(`${this.base_url}/get_rooms`, { withCredentials: true })
        ).then(data => {
            if (data?.room_ids) {
                return Object.entries(data.room_ids).map(([id, name]) => ({
                    id,
                    name: name as string
                }));
            }
            return [];
        }).catch(err => {
            console.error('Error getting rooms', err);
            return [];
        });
    }
}
