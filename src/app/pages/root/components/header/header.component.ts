import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { localStorageLabels, RoutesApp } from '../../../../enums';

import { AuthService } from '../../../auth/auth.service';

import {
  NzNotificationRef,
  NzNotificationService,
} from 'ng-zorro-antd/notification';
import { NzPopoverModule } from 'ng-zorro-antd/popover';

@Component({
  selector: 'app-header',
  imports: [RouterLink, FormsModule, NzPopoverModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Output() changeMenu: EventEmitter<boolean> = new EventEmitter();

  public profileRoute: string = `/${RoutesApp.profile}`;

  public currentLanguage: string = localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en';

  get localLanguage(): string {
    return localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en';
  }

  constructor(
    private _router: Router,
    private _authSvc: AuthService,
    private _nzNotificationSvc: NzNotificationService
  ) { }

  public error(errorResponse: any): NzNotificationRef {
    console.log({ errorResponse });

    return this._nzNotificationSvc.error(
      'error',
      'Something went wrong, please try again.'
    );
  }

  public logOut(): Promise<boolean | NzNotificationRef> {
    return this._authSvc
      .logOut()
      .then(() => {
        this._nzNotificationSvc.success('Log out', 'Come back soon.');
        return this._router.navigateByUrl(`/${RoutesApp.landingPage}`);
      })
      .catch((error) => this.error(error));
  }

  public languageChange(val: string): void {
    return localStorage.setItem(localStorageLabels.localCurrentLanguage, val);
  };
}
