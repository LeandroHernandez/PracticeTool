import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoutesApp } from '../../../constants';
import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';
import { AuthService } from '../auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { validateComplexPassword } from '../validate-complex-password';
import { UsersService } from '../../root/pages/users';
import { Subscription } from 'rxjs';
import { firebaseErrors } from '../../../constants/firebase-errors';

@Component({
  selector: 'app-log-in',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})

export class LogInComponent {
  public signUpUrl: string = `/${RoutesApp.auth}/${RoutesApp.signUp}`;

  public notEnabledTitle: string = 'This option will be enabled forward';

  public form: FormGroup;

  public showErrors: boolean = false;
  public showPassword: boolean = false;

  constructor (
    private _router: Router, 
    private _fb: FormBuilder, 
    private _authSvc: AuthService, 
    private _usersSvc: UsersService, 
    private _nzNotificationSvc: NzNotificationService
  ) {
    this.form = this._fb.group({
      email: ['', [ Validators.required, Validators.email ]],
      password: ['', [ Validators.required, validateComplexPassword() ]],
    })
  }
  
  public getControlErrors(control: string): Array<string> {
    return Object.keys(this.form.get(control)?.errors ?? {});
  }

  public letters(word: string): string[] {
    return word.split('');
  }

  public invalidForm(): NzNotificationRef {
    this.showErrors = true;
    return this._nzNotificationSvc.warning('Invalid Form', 'The form is not valid, please check out the values.');
  }

  public invalidCredentials(): NzNotificationRef {
    return this._nzNotificationSvc.warning('No matching user', 'There is no user matching the entered credentials.');
  }

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

  public submit(): void | NzNotificationRef | Promise<any> {
    console.log({ loginForm: this.form });

    if (this.form.invalid) return this.invalidForm();

    const { email, password } = this.form.value;

    return this._authSvc.logIn(email, password)
      .then(response => this.success(response))
      .catch(error => { if(error.code === firebaseErrors.invalidCredential) return this.invalidCredentials(); return error(error)});

  }
}
