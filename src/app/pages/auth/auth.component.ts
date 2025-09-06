import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

  get url(): Array<string> {
    return this._router.url.split('/');
  }

  get route(): string {
    return this.url[this.url.length - 1];
  }

  constructor (private _router: Router) {}

}
