import { Component } from '@angular/core';
import { INavItem } from '../../../../interfaces';
import { RoutesApp } from '../../../../enums';
import { Router, RouterLink } from '@angular/router';

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
          [title]="item.title"
          [routerLink]="['/' + item.route]"
        >
          <i [class]="'bi bi-' + item.icon"></i>
          {{ item.label }}
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
        padding: 10px;
        list-style: none;
        background-color: var(--secondary);
        color: var(--primary);
        position: fixed;
      }

      .li {
        padding: 10px;
        font-size: 16px;
        cursor: pointer;
        width: max-content;

        transition: 0.2s transform ease;

        &:hover {
          transform: scale(1.1);
        }
      }

      .active {
        color: var(--accent);
      }
    `,
  ],
})
export class NavComponent {
  public navList: Array<INavItem> = [
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
      label: 'Roles',
      title: 'Roles',
      route: RoutesApp.roles,
      icon: 'columns',
    },
    {
      label: 'Users',
      title: 'Users',
      route: RoutesApp.users,
      icon: 'people-fill',
    },
    {
      label: 'Dashboard',
      title: 'Dashboard',
      route: RoutesApp.dashboard,
      icon: 'columns-gap',
    },
    {
      label: 'Elements to Practice',
      title: 'Elements to Practice',
      route: RoutesApp.elementsToPractice,
      icon: 'translate',
    },
    {
      label: 'Practice Lists',
      title: 'Practice Lists',
      route: RoutesApp.practiceLists,
      icon: 'list-check',
    },
    {
      label: 'Test',
      title: 'Test',
      route: RoutesApp.test,
      icon: 'play-fill',
    },
  ];

  constructor(private _router: Router) {}

  get url(): string {
    return this._router.url;
  }
}
