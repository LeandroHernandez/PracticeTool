import { Component } from '@angular/core';
import { INavItem } from '../../../../interfaces';
import { RoutesApp } from '../../../../enums';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-nav',
  imports: [RouterLink],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
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
      icon: 'columns'
    },
    {
      label: 'Users',
      title: 'Users',
      route: RoutesApp.users,
      icon: 'people-fill'
    },
    {
      label: 'Dashboard',
      title: 'Dashboard',
      route: RoutesApp.dashboard,
      icon: 'columns-gap'
    },
    {
      label: 'Elements to Practice',
      title: 'Elements to Practice',
      route: RoutesApp.elementsToPractice,
      icon: 'translate'
    },
    {
      label: 'Practice Lists',
      title: 'Practice Lists',
      route: RoutesApp.practiceLists,
      icon: 'list-check'
    },
    {
      label: 'Test',
      title: 'Test',
      route: RoutesApp.test,
      icon: 'play-fill'
    },
  ];

  constructor (private _router: Router) {}

  get url(): string {
    return this._router.url;
  }

}
