import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Footer } from '../../shared/footer/footer';

@Component({
    selector: 'home-page',
    standalone: true,
    imports: [RouterLink, Footer],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})

export class Home {
}
