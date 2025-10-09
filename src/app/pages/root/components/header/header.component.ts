import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NzPopoverModule } from 'ng-zorro-antd/popover'; 
import { AuthService } from '../../../auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';
import { RoutesApp } from '../../../../enums';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';

@Component({
  selector: 'app-header',
  imports: [RouterLink, NzDropDownModule, NzPopoverModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Output() changeMenu: EventEmitter<boolean> = new EventEmitter();

  public profileRoute: string = `/${RoutesApp.profile}`

  constructor(private _router: Router, private _authSvc: AuthService, private _nzNotificationSvc: NzNotificationService) {}
  
  public error(errorResponse: any): NzNotificationRef {
    console.log({ errorResponse });
    
    return this._nzNotificationSvc.error('error', 'Something went wrong, please try again.');
  }

  public logOut(): Promise<boolean | NzNotificationRef> {
    return this._authSvc.logOut()
    .then(() => {
      this._nzNotificationSvc.success('Log out', 'Come back soon.');
      return this._router.navigateByUrl(`/${RoutesApp.landingPage}`)
    })
    .catch(error => this.error(error));
  }

}
