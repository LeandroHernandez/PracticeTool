import { AfterViewInit, Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { Driver, driver } from 'driver.js';
import "driver.js/dist/driver.css";

import { firebaseErrors, localStorageLabels, RoutesApp } from '../../enums';

import { HeaderComponent } from './components/header/header.component';
import { NavComponent } from './components/nav/nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, NavComponent],
  templateUrl: './root.component.html',
  styleUrl: './root.component.css'
})
export class RootComponent implements AfterViewInit {
  // title = 'practiceTool';

  public showNav: boolean = false;
  public ej: string = firebaseErrors.auth.emailAlreadyInUse;

  get en(): boolean {
    const en = localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en'
    return en === 'en';
  }

  get driverObj(): Driver {
    return driver({
      showProgress: true,
      steps: [
        {
          // element: `.main-button-menu`,
          popover: {
            title: 'Tutorial',
            description: this.en ? 'It appears this is your first time using Practice Tool on this device, so here is the tutorial.' : 'Parece que es la primera vez que haces uso de Practice Tool en este dispositivo por lo cual aquí te presentamos el tutorial.',
          },
          onHighlightStarted: () => {
            this._router.navigateByUrl(`/${RoutesApp.dashboard}`)
          }
        },
        {
          element: `.main-dashboard`,
          popover: {
            title: this.en ? 'Dashboard' : 'Tablero',
            description: this.en ? 'Here you can see several data and statistics related to your study process.' : 'Aquí puede ver distintos datos y estadisticas referentes a su proceso de estudio.',
          },
          onHighlightStarted: () => {
            this._router.navigateByUrl(`/${RoutesApp.dashboard}`)
          }
        },
        {
          element: `.main-button-menu`,
          popover: {
            title: this.en ? 'Menu' : 'Menú',
            description: this.en ? 'Here you can open and close the navigation menu.' : 'Aquí puede abrir y cerrar el menú de navegación.',
          }
        },
        {
          element: `.main-li-menu-${RoutesApp.elementsToPractice}`,
          popover: {
            title: this.en ? 'Elements To Practice' : 'Elementos a practicar',
            description: this.en ? 'Here you can access all the elements to practice registered in the system.' : 'Aquí usted podrá acceder a todos los elementos a practicar registrados en el sistema.',
          },
          onHighlightStarted: () => {
            this.showNav = true;
            this._router.navigateByUrl(`/${RoutesApp.elementsToPractice}`);
          }
        },
        {
          element: `.module-table`,
          popover: {
            title: this.en ? 'Table of elements to practice' : 'Tabla de elementos a practicar',
            description: this.en ? 'Here you can view, filter, and select all the types of elements to practice that are registered.' : 'Aquí usted puede ver, filtrar y seleccionar todos los tipos de elementos a practicar que hay registrados.',
          },
          onHighlightStarted: () => {
            this.showNav = false;
            this._router.navigateByUrl(`/${RoutesApp.elementsToPractice}`);
          }
        },
        {
          element: `.header-test-button`,
          popover: {
            title: this.en ? 'Test of elements to practice' : 'Prueba de elementos a practicar',
            description: this.en ? 'Here you can take customized quizzes to review elements to practice.' : 'Aquí usted puede realizar pruebas personalizadas de repaso de elementos a practicar.',
          },
          onHighlightStarted: () => {
            this.showNav = false;
            this._router.navigateByUrl(`/${RoutesApp.elementsToPractice}`)
          }
        },
        {
          element: `.main-li-menu-${RoutesApp.practiceLists}`,
          popover: {
            title: this.en ? 'Practice lists' : 'Listas de practica',
            description: this.en ? 'Here you can access all the practice lists registered in the system.' : 'Aquí usted podrá acceder a todos las listas de practica registradas en el sistema.',
          },
          onHighlightStarted: () => {
            this.showNav = true;
            this._router.navigateByUrl(`/${RoutesApp.practiceLists}`);
          }
        },
        {
          element: `.module-table`,
          popover: {
            title: this.en ? 'Table of practice lists' : 'Tabla de listas de practica',
            description: this.en ? 'Here you can view, filter, and select all the types of practice lists that are registered.' : 'Aquí usted puede ver, filtrar y seleccionar todos los tipos de listas de practica que hay registrados.',
          },
          onHighlightStarted: () => {
            this.showNav = false;
            this._router.navigateByUrl(`/${RoutesApp.practiceLists}`);
          }
        },
        {
          element: `.header-test-button`,
          popover: {
            title: this.en ? 'Test of practice lists' : 'Prueba de listas de practica',
            description: this.en ? 'Here you can take customized quizzes to review practice lists.' : 'Aquí usted puede realizar pruebas personalizadas de repaso de listas de practica.',
          },
          onHighlightStarted: () => {
            this.showNav = false;
            this._router.navigateByUrl(`/${RoutesApp.practiceLists}`)
          }
        },
      ],
      allowKeyboardControl: true,
      onDestroyed: () => localStorage.setItem(localStorageLabels.tutoFinished, 'true')
    });
  }

  get tuto(): boolean | void {
    return !localStorage.getItem(localStorageLabels.tutoFinished) ? this.driverObj.drive() : false;
  }

  constructor(private _router: Router) { }

  // ngOnInit(): void {
  //   this.showTuto()
  // }

  ngAfterViewInit(): void {
    if (localStorage.getItem(localStorageLabels.tutoFinished)) return;
    setTimeout(() => {
      this.showTuto();
    }, 500); // espera medio segundo
  }

  public showTuto(): void {
    return this.driverObj.drive();
  }

  onContentClick(event: MouseEvent): void {
    // const target = event.target as HTMLElement;
    // console.log({ target })
    // if (target.classList.contains('content') || target.classList.contains('main')) {
    //   this.showNav = false;
    // }
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();

    // Lista de etiquetas que NO deberían cerrar el nav
    const exceptions = ['input', 'select', 'textarea', 'button', 'label'];

    if (!exceptions.includes(tagName)) {
      this.showNav = false;
    }
  }

}
