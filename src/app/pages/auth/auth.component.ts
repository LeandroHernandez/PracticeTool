import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { localStorageLabels } from '../../enums';

@Component({
  selector: 'app-auth',
  imports: [RouterOutlet, RouterLink],
  // templateUrl: './auth.component.html',
  template: `
  <!-- <p>auth works!</p> -->
  
  <main [class]="'main-' + route">
    <button class="button-back-to-landing-page" [routerLink]="['/landing-page']" >
      <i class="bi bi-arrow-left"></i> {{ localLanguage=== 'en' ? 'Back To Landing Page' : ' Volver a la Landing Page ' }}
    </button>
    <section class="section">
      <div [class]="'card-container ' + route">
        <div class="card-bg"></div>
        <div class="card-bg2"></div>
        <div class="card">
          <header class="header-card">
            <h6 class="h6-card"> PRACTICE TOOL </h6>
            <div class="actions-card">
              <button class="button-card-auth {{route === 'sign-up' ? 'active' : ''}}" [routerLink]="['/auth/sign-up']" >{{ localLanguage === 'en' ? 'Sign Up' : 'Registrarse'}}</button>
              <button class="button-card-auth {{route === 'log-in' ? 'active' : ''}}" [routerLink]="['/auth/log-in']" >{{ localLanguage === 'en' ? 'Log In' : 'Ingresar'}}</button>
            </div>
          </header>
        </div>
      </div>
      <div class="router-components">
        <router-outlet></router-outlet>
      </div>
    </section>
  </main>
  `,
  styleUrl: './auth.component.css'
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

  constructor (private _router: Router) {}

}
