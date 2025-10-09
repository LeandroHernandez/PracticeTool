import { AfterViewInit, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { localStorageLabels, RoutesApp } from '../../enums';
import { FeaturesComponent, HomeComponent, PricingComponent, ReviewsComponent } from './components';
import { ObserveSectionDirective } from './observe-section.directive';
import { FormsModule } from '@angular/forms';
import { ViewportScroller } from '@angular/common';

interface IEnEs {
  en: string;
  es: string;
}

interface Iitem {
  route: string;
  label: IEnEs;
}

interface IFooterList {
  tittle: IEnEs;
  items: Iitem[];
}

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, FormsModule, FeaturesComponent, HomeComponent, PricingComponent, ReviewsComponent, ObserveSectionDirective],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent implements AfterViewInit {

  public baseRoute: string = `/${RoutesApp.landingPage}`;
  public signInRoute: string = `/${RoutesApp.auth}/${RoutesApp.logIn}`;
  public signUpRoute: string = `/${RoutesApp.auth}/${RoutesApp.signUp}`;

  public footerLists: IFooterList[] = [
    {
      tittle: { en: 'Product', es: 'Producto' },
      items: [
        {
          label: { en: 'Features', es: 'Caracteristicas' },
          route: 'features',
        },
        {
          label: { en: 'Pricing', es: 'Precios' },
          route: 'pricing',
        },
        {
          label: { en: 'Mobile App', es: 'Aplicación Mobil' },
          route: '',
        },
      ]
    },
    {
      tittle: { en: 'Support', es: 'Soporte' },
      items: [
        {
          label: { en: 'Help Center', es: 'Centro de Ayuda' },
          route: '',
        },
        {
          label: { en: 'Contact Us', es: 'Contactanos' },
          route: '',
        },
        {
          label: { en: 'Community', es: 'Comunidad' },
          route: '',
        },
      ]
    },
    {
      tittle: { en: 'Company', es: 'Empresa' },
      items: [
        {
          label: { en: 'About', es: 'Acerca' },
          route: '',
        },
        {
          label: { en: 'Blog', es: 'Blog' },
          route: '',
        },
        {
          label: { en: 'Privacy', es: 'Privacidad' },
          route: '',
        },
      ]
    },
  ]

  public navShow: boolean = false;
  public activeSection: string = 'home';
  public currentLanguage: string = localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en';
  
  get localLanguage(): string {
    return localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en';
  }

  constructor(private _viewportScroller: ViewportScroller) {}

  ngAfterViewInit() {
    this.scrollTop();
  }

  scrollTop() {
    this._viewportScroller.scrollToPosition([0, 0]);
  }

  public languageChange(val: string): void {
    return localStorage.setItem(localStorageLabels.localCurrentLanguage, val);
  };

}
