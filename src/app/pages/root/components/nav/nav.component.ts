import { Component, OnInit } from '@angular/core';
import { TNavItem } from '../../../../interfaces';
import { localStorageLabels, RoutesApp } from '../../../../enums';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth';
import { UsersService } from '../../pages/users';
import { ModulesService } from '../../pages/modules';
import { RolesService } from '../../pages/roles';

@Component({
  selector: 'app-nav',
  imports: [RouterLink],
  // templateUrl: './nav.component.html',
  template: `
    <!-- <p>nav works!</p> -->
    <div class="nav_container">
      <ul class="ul">
        @for(item of navList; track item.route) {
        <li
          class="li {{ url.startsWith('/' + item.route) ? 'active' : '' }} main-li-menu-{{item.route}}"
          [title]="item.title[this.localLanguage === 'en' ? 'en' : 'es']"
          [routerLink]="['/' + item.route]"
          (click)="item.route !== 'test' ? false : resetSelectedItems()"
        >
          <i [class]="'bi bi-' + item.icon"></i>
          {{ item.label[this.localLanguage === 'en' ? 'en' : 'es'] }}
        </li>
        }
      </ul>
    </div>
  `,
  // styleUrl: './nav.component.css'
  styles: [
    `
      .nav_container {
        height: 100%;
        width: 171.38px;
      }

      .ul {
        height: 100%;
        padding: .8rem;
        list-style: none;
        background-color: var(--secondary);
        color: var(--primary);
        position: fixed;

        &:has(.li:hover) .li:not(:hover) {
          opacity: 0.5;
        }
      }

      .li {
        padding: .8rem;
        font-size: 16px;
        cursor: pointer;
        min-width: 100%;
        width: max-content;

        transition-duration: 0.2s;
        transition-property: transform, background-color;

        &:hover {
          transform: scale(1.1);
          background-color: #111023;
        }
      }

      .active {
        color: var(--accent);
      }
    `,
  ],
})
export class NavComponent implements OnInit {

  public navList: Array<TNavItem> = [];

  get url(): string {
    return this._router.url;
  }

  get localLanguage(): string {
    return localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en';
  }

  constructor(
    private _authSvc: AuthService,
    private _usersSvc: UsersService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this._authSvc.userState().subscribe(user => {
      if (!user) {
        this._router.navigate(['/landing-page']);
      }
    });
    this.getModules();
  }

  public getModules(): void {
    this._authSvc.userState().subscribe(user => {
      if (user) {
        // Logic to get modules can be added here
        const { email } = user;
        this._usersSvc.getFilteredUsers({ email }).subscribe(users => {
          const userData = users[0];
          if (!userData) throw new Error('User not found');

          const modules = userData.role?.assignedModules ?? [];
          if (modules.length > 0) this.navList = modules.map(mod => {
            const { label, title, route, icon } = mod;
            return {
              label,
              title,
              route,
              icon,
            };
          });
        });
      } else {
        this._router.navigate([RoutesApp.landingPage]);
      }
    });
  }

  public resetSelectedItems(): void {
    return localStorage.removeItem(localStorageLabels.etp.customSelectedList);
  }
}
