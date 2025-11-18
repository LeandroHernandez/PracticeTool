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
          class="li {{ url.startsWith('/' + item.route) ? 'active' : '' }}"
          [title]="item.title[this.localLanguage === 'en' ? 'en' : 'es']"
          [routerLink]="['/' + item.route]"
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

  get localLanguage(): string {
    return localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en';
  }

  // get navList(): Array<TNavItem> {
  //   const en = this.localLanguage === 'en';
  //   return [
  //     // {
  //     //   label: 'Words',
  //     //   title: 'Words',
  //     //   route: RoutesApp.words,
  //     //   icon: 'file-word'
  //     // },
  //     // {
  //     //   label: 'Phrasal Verbs',
  //     //   title: 'Phrasal Verbs',
  //     //   route: RoutesApp.phrasalVerbs,
  //     //   icon: 'diagram-2'
  //     // },
  //     // {
  //     //   label: 'Idioms',
  //     //   title: 'Idioms',
  //     //   route: RoutesApp.idioms,
  //     //   icon: 'globe-americas'
  //     // },
  //     // {
  //     //   label: 'Expressions',
  //     //   title: 'Expressions',
  //     //   route: RoutesApp.expressions,
  //     //   icon: 'translate'
  //     // },
  //     {
  //       label: en ? 'Modules' : 'Módulos',
  //       title: en ? 'Modules' : 'Módulos',
  //       route: RoutesApp.modules,
  //       icon: 'microsoft',
  //     },
  //     {
  //       label: 'Roles',
  //       title: 'Roles',
  //       route: RoutesApp.roles,
  //       icon: 'columns',
  //     },
  //     {
  //       label: en ? 'Users' : 'Usuarios',
  //       title: en ? 'Users' : 'Usuarios',
  //       route: RoutesApp.users,
  //       icon: 'people-fill',
  //     },
  //     {
  //       label: en ? 'Dashboard' : 'Tablero',
  //       title: en ? 'Dashboard' : 'Tablero',
  //       route: RoutesApp.dashboard,
  //       icon: 'columns-gap',
  //     },
  //     {
  //       label: en ? 'Elements to Practice' : 'Elementos a Practicar',
  //       title: en ? 'Elements to Practice' : 'Elementos a Practicar',
  //       route: RoutesApp.elementsToPractice,
  //       icon: 'translate',
  //     },
  //     {
  //       label: en ? 'Practice Lists' : 'Listas de Práctica',
  //       title: en ? 'Practice Lists' : 'Listas de Práctica',
  //       route: RoutesApp.practiceLists,
  //       icon: 'list-check',
  //     },
  //     {
  //       label: en ? 'Test' : 'Prueba',
  //       title: en ? 'Test' : 'Prueba',
  //       route: RoutesApp.test,
  //       icon: 'play-fill',
  //     },
  //   ];
  // }
  public navList: Array<TNavItem> = [
    // {
    //   label: 'Words',
    //   title: 'Words',
    //   route: RoutesApp.words,
    //   icon: 'file-word'
    // },
    // {
    //   label: 'Phrasal Verbs',
    //   title: 'Phrasal Verbs',
    //   route: RoutesApp.phrasalVerbs,
    //   icon: 'diagram-2'
    // },
    // {
    //   label: 'Idioms',
    //   title: 'Idioms',
    //   route: RoutesApp.idioms,
    //   icon: 'globe-americas'
    // },
    // {
    //   label: 'Expressions',
    //   title: 'Expressions',
    //   route: RoutesApp.expressions,
    //   icon: 'translate'
    // },
    {
      label: { en: 'Modules', es: 'Módulos' },
      title: { en: 'Modules', es: 'Módulos' },
      route: RoutesApp.modules,
      icon: 'microsoft',
    },
    {
      label: { en: 'Roles', es: 'Roles' },
      title: { en: 'Roles', es: 'Roles' },
      route: RoutesApp.roles,
      icon: 'columns',
    },
    {
      label: { en: 'Users', es: 'Usuarios' },
      title: { en: 'Users', es: 'Usuarios' },
      route: RoutesApp.users,
      icon: 'people-fill',
    },
    {
      label: { en: 'Dashboard', es: 'Tablero' },
      title: { en: 'Dashboard', es: 'Tablero' },
      route: RoutesApp.dashboard,
      icon: 'columns-gap',
    },
    {
      label: { en: 'Elements to Practice', es: 'Elementos a Practicar' },
      title: { en: 'Elements to Practice', es: 'Elementos a Practicar' },
      route: RoutesApp.elementsToPractice,
      icon: 'translate',
    },
    {
      label: { en: 'Practice Lists', es: 'Listas de Práctica' },
      title: { en: 'Practice Lists', es: 'Listas de Práctica' },
      route: RoutesApp.practiceLists,
      icon: 'list-check',
    },
    {
      label: { en: 'Test', es: 'Prueba' },
      title: { en: 'Test', es: 'Prueba' },
      route: RoutesApp.test,
      icon: 'play-fill',
    },
  ];


  get url(): string {
    return this._router.url;
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
}
