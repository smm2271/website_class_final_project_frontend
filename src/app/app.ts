import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from '../app/shared/nav-bar/nav-bar'

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NavBar],
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App {
    protected readonly title = signal('final_project');
}
