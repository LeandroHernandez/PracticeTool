import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { RoutesApp } from '../../../constants';

import { AuthService } from '../auth.service';
import { UsersService } from '../../root/pages/users';

import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';
import { firebaseErrors } from '../../../constants/firebase-errors';
import { validateComplexPassword } from '../validate-complex-password';

@Component({
  selector: 'app-sign-up',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  public logInUrl: string = `/${RoutesApp.auth}/${RoutesApp.logIn}`;

  public notEnabledTitle: string = 'This option will be enabled forward';

  public form: FormGroup;

  public showErrors: boolean = false;
  public showPassword: boolean = false;

  constructor(
      private _fb: FormBuilder, 
      private _router: Router, 
      private _authSvc: AuthService, 
      private _userSvc: UsersService, 
      private _nzNotificationSvc: NzNotificationService
    ) {
    this.form = this._fb.group({
      email: ['', [ Validators.required, Validators.email, Validators.maxLength(30) ]],
      names: ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]],
      lastnames: ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]],
      password: ['', [ Validators.required, Validators.minLength(6), validateComplexPassword(), Validators.maxLength(20) ]],
      role: ['0DVyrvO2rmDJZ6MoNBgv'],
      createdAt: [new Date],
      lastUpdate: [new Date],
      state: [true]
    });
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

  public success(successResponse: any, byProvider?: boolean): Promise<boolean> {
    console.log({ successResponse });

    this._nzNotificationSvc.success('Success', 'You have been reistered successfully.');

    // return this._router.navigateByUrl(`/${RoutesApp.auth}/${RoutesApp.logIn}`);
    return this._router.navigateByUrl( !byProvider ? `/${RoutesApp.auth}/${RoutesApp.logIn}` : `/${RoutesApp.dashboard}`);
  }

  public emailAlreadyInUseError (): Promise<boolean> {

    this._nzNotificationSvc.warning('Email already in use', `Actually you already have an account, let's log in.`);

    return this._router.navigateByUrl(`/${RoutesApp.auth}/${RoutesApp.logIn}`);
  }

  public error(errorResponse: any, message?: string): NzNotificationRef | any {
    console.log({ errorResponse });

    if (errorResponse.code === firebaseErrors.emailAlreadyInUse) return this.emailAlreadyInUseError();

    return this._nzNotificationSvc.error('error', message ?? 'Something went wrong, please try again.');
  }

  public googleAuth(): Promise<boolean | NzNotificationRef> {
    return this._authSvc.googleAuth()
    .then(googleAuthResponse => this.success(googleAuthResponse, true))
    .catch(error => this.error(error));
  }

  public submit(): Promise<boolean | NzNotificationRef> | NzNotificationRef {
    console.log({ form: this.form });
    if (this.form.invalid) return this.invalidForm();
    
    const { email, password } = this.form.value;
    return this._authSvc.signUp(email, password)
    .then(sigUpResponse => {
      // return this.success(sigUpResponse);
      return this._userSvc.addUser(this.form.value)
      .then( addUserResponse => { console.log({ addUserResponse }); return this.success(sigUpResponse); } )
      .catch(error => {
        this._authSvc.delete(sigUpResponse.user).then(() => {})
        return this.error(error);
      });
    })
    .catch(error => this.error(error));
  }

}
