import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { ChatMessageService } from '../../../services/message-service/message.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.html',
    styleUrls: ['./sidebar.scss'],
})
export class Sidebar implements OnInit {
    @Output() chatSelected = new EventEmitter<{ id: string; name: any }>();

    rooms: any[] = []; // 先定義陣列

    constructor(private chatMessageService: ChatMessageService) { }

    ngOnInit() {
        this.updateRooms();
    }

    updateRooms() {
        this.chatMessageService.getRooms().then(rooms => {
            this.rooms = rooms;
            console.log("Updated chat rooms");
            console.log(this.rooms);
        });
    }

    selectChat(room: { id: string; name: any }) {
        this.chatSelected.emit(room);
    }
    createRoom() {
        const roomName = prompt('Enter room name:');
        if (roomName) {
            this.chatMessageService.createRoom(roomName).then(() => {
                this.updateRooms();
            });
        }
    }
}
