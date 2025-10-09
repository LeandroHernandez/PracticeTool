import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { firebaseErrors, localStorageLabels, RoutesApp } from '../../../enums';

import { AuthService } from '../auth.service';
import { UsersService } from '../../root/pages/users';

import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';
import { validateComplexPassword } from '../validate-complex-password';
import { NzPopoverModule } from 'ng-zorro-antd/popover';

@Component({
  selector: 'app-sign-up',
  imports: [RouterLink, ReactiveFormsModule, NzPopoverModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  public logInUrl: string = `/${RoutesApp.auth}/${RoutesApp.logIn}`;

  public notEnabledTitle: string = this.localLanguage === 'en' ? 'This option will be enabled forward' : 'Esta opción estará habiliotada más adelante';

  public form: FormGroup;
  public languageForm: FormGroup;

  public showErrors: boolean = false;
  public showPassword: boolean = false;
  
  get localLanguage(): string {
    return localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en';
  }

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
      // createdAt: [new Date],
      // lastUpdate: [new Date],
      state: [true]
    });

    this.languageForm = this._fb.group({
      language: ['en'],
    })

    this.languageForm.get('language')?.valueChanges.subscribe(val => this.languageChange(val));
  }

  public languageChange(val: string): void {
    return localStorage.setItem(localStorageLabels.localCurrentLanguage, val);
  };
  
  public getControlErrors(control: string): Array<string> {
    return Object.keys(this.form.get(control)?.errors ?? {});
  }

  public letters(word: string): string[] {
    return word.split('');
  }

  public invalidForm(): NzNotificationRef {
    this.showErrors = true;
    return this._nzNotificationSvc.warning(this.localLanguage === 'en' ? 'Invalid Form' : 'Formulario Invalido', this.localLanguage === 'en' ? 'The form is not valid, please check out the values.' : 'El Formulario no es valido, por favor revise los valores');
  }

  public success(successResponse: any): Promise<boolean> {
    console.log({ successResponse });

    this._nzNotificationSvc.success(this.localLanguage === 'en' ? 'Success' : 'Correcto', this.localLanguage === 'en' ? 'You have been reistered successfully.' : 'Ha sido registrado exitosamente');

    return this._router.navigateByUrl(`/${RoutesApp.dashboard}`);
  }

  public emailAlreadyInUseError (): Promise<boolean> {

    this._nzNotificationSvc.warning(this.localLanguage === 'en' ? 'Email already in use' : 'Correo en uso' , this.localLanguage === 'en' ? `Actually you already have an account, let's log in.` : 'De hecho usted ya tiene una cuenta, vamos a ingresar' );

    return this._router.navigateByUrl(`/${RoutesApp.auth}}/${RoutesApp.logIn}`);
  }

  public error(errorResponse: any, message?: string): NzNotificationRef | any {
    console.log({ errorResponse });

    if (errorResponse.code === firebaseErrors.auth.emailAlreadyInUse) return this.emailAlreadyInUseError();

    return this._nzNotificationSvc.error('error', this.localLanguage ? 'Something went wrong, please try again.' : 'Algo salio mal, por favor vuelva a intentarlo.');
  }

  // public googleAuth(): Promise<boolean | NzNotificationRef> {
  //   return this._authSvc.googleAuth()
  //   // .then(googleAuthResponse => this.success(googleAuthResponse, true))
  //   .then(googleAuthResponse => this.success(googleAuthResponse))
  //   .catch(error => this.error(error));
  // }

  public submit(): Promise<boolean | NzNotificationRef> | NzNotificationRef {
    console.log({ form: this.form });
    if (this.form.invalid) return this.invalidForm();
    
    const { email, password } = this.form.value;
    return this._authSvc.signUp(email, password)
    .then(sigUpResponse => {
      // return this.success(sigUpResponse);
      const d: number = Date.now();
      return this._userSvc.addUser({...this.form.value, createdAt: d, lastUpdate: d})
      .then( addUserResponse => { console.log({ addUserResponse }); return this.success(sigUpResponse); } )
      .catch(error => {
        this._authSvc.delete(sigUpResponse.user).then(() => {})
        return this.error(error);
      });
    })
    .catch(error => this.error(error));
  }

}
