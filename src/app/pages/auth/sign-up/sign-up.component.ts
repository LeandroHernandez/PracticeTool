import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { RoutesApp } from '../../../constants';

import { AuthService } from '../auth.service';
import { UsersService } from '../../root/pages/users';

import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';

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

  constructor(
      private _fb: FormBuilder, 
      private _router: Router, 
      private _authSvc: AuthService, 
      private _userSvc: UsersService, 
      private _nzNotificationSvc: NzNotificationService
    ) {
    function validateComplexPassword(): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        
        if (!value) {
          // No es un error si el campo no tiene valor (puedes combinar esto con el validador `required`)
          return null;
        }
        
        // Expresión regular para los requisitos
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value); // Ajusta los caracteres según tus necesidades
        
        if (hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar) {
          return null; // El password es válido
        } else {
          // Devolvemos un objeto de error indicando qué falló
          return {
            complexPassword: {
              hasUpperCase,
              hasLowerCase,
              hasNumber,
              hasSpecialChar,
            },
          };
        }
      };
    }
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

  public invalidForm(): NzNotificationRef {
    return this._nzNotificationSvc.warning('Invalid Form', 'The form is not valid, please check out the values.')
  }

  public success(successResponse: any): Promise<boolean> {
    console.log({ successResponse });

    this._nzNotificationSvc.success('Success', 'You have been reistered successfully.');

    return this._router.navigateByUrl(`/${RoutesApp.auth}/${RoutesApp.logIn}`);
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

  public submit(): Promise<boolean | NzNotificationRef> | NzNotificationRef {
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
