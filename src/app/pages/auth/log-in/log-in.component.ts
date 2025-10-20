import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { firebaseErrors, localStorageLabels, RoutesApp } from '../../../enums';

import { UsersService } from '../../root/pages/users';
import { AuthService } from '../auth.service';

import { validateComplexPassword } from '../validate-complex-password';

import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';
import { NzPopoverModule } from 'ng-zorro-antd/popover';

@Component({
  selector: 'app-log-in',
  imports: [RouterLink, ReactiveFormsModule, NzPopoverModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})

export class LogInComponent {
  public signUpUrl: string = `/${RoutesApp.auth}/${RoutesApp.signUp}`;

  public notEnabledTitle: string = this.localLanguage === 'en' ? 'This option will be enabled forward' : 'Esta opción estará habiliotada más adelante';

  public form: FormGroup;
  public languageForm: FormGroup;

  public showErrors: boolean = false;
  public showPassword: boolean = false;

  get localLanguage(): string {
    return localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en';
  }

  constructor(
    private _router: Router,
    private _fb: FormBuilder,
    private _authSvc: AuthService,
    private _usersSvc: UsersService,
    private _nzNotificationSvc: NzNotificationService
  ) {
    this.form = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, validateComplexPassword()]],
    })

    this.languageForm = this._fb.group({
      language: ['en'],
    })

    this.languageForm.get('language')?.valueChanges.subscribe(val => this.languageChange(val));
  }

  public getControlErrors(control: string): Array<string> {
    return Object.keys(this.form.get(control)?.errors ?? {});
  }

  public languageChange(val: string): void {
    return localStorage.setItem(localStorageLabels.localCurrentLanguage, val);
  };

  public letters(word: string): string[] {
    return word.split('');
  }

  public invalidForm(): NzNotificationRef {
    this.showErrors = true;
    return this._nzNotificationSvc.warning(this.localLanguage === 'en' ? 'Invalid Form' : 'Formulario Invalido', this.localLanguage === 'en' ? 'The form is not valid, please check out the values.' : 'El Formulario no es valido, por favor revise los valores');
  }

  public invalidCredentials(): NzNotificationRef {
    return this._nzNotificationSvc.warning(this.localLanguage === 'en' ? 'No matching user' : 'Usuario no encontrado', this.localLanguage === 'en' ? 'There is no user matching the entered credentials.' : 'Ningún uuario corresponde a las credenciales ingresadas');
  }

  public success(successResponse: any): Promise<boolean> {
    console.log({ successResponse });

    // this._nzNotificationSvc.success('Success', 'You have been reistered successfully.');

    return this._router.navigateByUrl(`/${RoutesApp.dashboard}`);
  }

  public error(errorResponse: any): NzNotificationRef {
    console.log({ errorResponse });

    return this._nzNotificationSvc.error('error', this.localLanguage ? 'Something went wrong, please try again.' : 'Algo salio mal, por favor vuelva a intentarlo.');
  }

  // public googleAuth(): Promise<boolean | NzNotificationRef> {

  //   // this._usersSvc.getFilteredUsers({email: })

  //   return this._authSvc.googleAuth()
  //   .then(googleAuthResponse => this.success(googleAuthResponse))
  //   .catch(error => this.error(error));
  // }

  public submit(): void | NzNotificationRef | Promise<any> {
    console.log({ loginForm: this.form });

    if (this.form.invalid) return this.invalidForm();

    const { email, password } = this.form.value;

    return this._authSvc.logIn(email, password)
      .then(response => this.success(response))
      .catch(error => { if (error.code === firebaseErrors.auth.invalidCredential) return this.invalidCredentials(); return error(error) });

  }
}
