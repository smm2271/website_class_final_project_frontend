import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessageService, Room } from '../../../services/message-service/message.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './sidebar.html',
    styleUrls: ['./sidebar.scss'],
})
export class Sidebar implements OnInit {
    @Input() activeRoomId?: string;
    @Output() chatSelected = new EventEmitter<Room>();

    rooms: Room[] = []; // 先定義陣列

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

    selectChat(room: Room) {
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
    joinRoom() {
        const roomName = prompt('Enter room id:');
        if (roomName) {
            this.chatMessageService.joinRoom(roomName);
        }
        this.updateRooms();
    }
}
