import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { localStorageLabels } from '../../enums';

@Component({
  selector: 'app-auth',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {

  get url(): Array<string> {
    return this._router.url.split('/');
  }

  get route(): string {
    return this.url[this.url.length - 1];
  }

  get localLanguage(): string {
    return localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en';
  }

  constructor(private _router: Router) { }

}
