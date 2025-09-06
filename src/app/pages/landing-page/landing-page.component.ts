import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoutesApp } from '../../constants';
import { FeaturesComponent, HomeComponent, PricingComponent, ReviewsComponent } from './components';

interface Iitem {
  route: string;
  label: string;
}

interface IFooterList {
  tittle: string;
  items: Iitem[];
}

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, FeaturesComponent, HomeComponent, PricingComponent, ReviewsComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

  public baseRoute: string = `/${RoutesApp.landingPage}`;
  public signInRoute: string = `/${RoutesApp.auth}/${RoutesApp.logIn}`;
  public signUpRoute: string = `/${RoutesApp.auth}/${RoutesApp.signUp}`;

  public footerLists: IFooterList[] = [
    {
      tittle: 'Product',
      items: [
        {
          label: 'Features',
          route: 'features',
        },
        {
          label: 'Pricing',
          route: 'pricing',
        },
        {
          label: 'Mobile App',
          route: '',
        },
      ]
    },
    {
      tittle: 'Support',
      items: [
        {
          label: 'Help Center',
          route: '',
        },
        {
          label: 'Contact Us',
          route: '',
        },
        {
          label: 'Community',
          route: '',
        },
      ]
    },
    {
      tittle: 'Company',
      items: [
        {
          label: 'About',
          route: '',
        },
        {
          label: 'Blog',
          route: '',
        },
        {
          label: 'Privacy',
          route: '',
        },
      ]
    },
  ]

  public navShow: boolean = true;

}
