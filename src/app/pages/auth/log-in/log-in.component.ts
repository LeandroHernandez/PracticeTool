import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoutesApp } from '../../../constants';
import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-log-in',
  imports: [RouterLink],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent {
  public signUpUrl: string = `/${RoutesApp.auth}/${RoutesApp.signUp}`;

  public notEnabledTitle: string = 'This option will be enabled forward';

  constructor (private _router: Router, private _authSvc: AuthService, private _nzNotificationSvc: NzNotificationService) {}

  public success(successResponse: any): Promise<boolean> {
    console.log({ successResponse });

    // this._nzNotificationSvc.success('Success', 'You have been reistered successfully.');

    return this._router.navigateByUrl(`/${RoutesApp.dashboard}`);
  }

  public error(errorResponse: any): NzNotificationRef {
    console.log({ errorResponse });

    return this._nzNotificationSvc.error('error', 'Something went wrong, please try again.');
  }
  
  public googleAuth(): Promise<boolean | NzNotificationRef> {
    return this._authSvc.googleAuth()
    .then(googleAuthResponse => this.success(googleAuthResponse))
    .catch(error => this.error(error));
  }
}
