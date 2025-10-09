import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { UsersService } from '../users';
import { AuthService, validateComplexPassword } from '../../../auth';

import { localStorageLabels, RoutesApp } from '../../../../enums';
import { IUser } from '../../../../interfaces';

import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzPopoverModule } from 'ng-zorro-antd/popover';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, NzPopoverModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})

export class ProfileComponent implements OnInit {
  
  public user: IUser | null = null;
  public form: FormGroup;

  public showErrors: boolean = false;
  public showPassword: boolean = false;

  get localLanguage(): string {
    return localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en';
  }

  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _authSvc: AuthService,
    private _usersSvc: UsersService,
    private _nzNotificationSvc: NzNotificationService
  ) {
    this.form = this._fb.group({
      email: ['', [ Validators.required, Validators.email, Validators.maxLength(30) ]],
      names: ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]],
      lastnames: ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]],
      password: ['', [ Validators.required, Validators.minLength(6), validateComplexPassword(), Validators.maxLength(20) ]],
      role: [''],
      // createdAt: [],
      // lastUpdate: [new Date],
      state: []
    });
  }

  ngOnInit(): void {
    this.getUser();
  }
  
  public getUser(): Subscription {
    
    const notFindUser = (err?: any): Promise<boolean> => {
      if (err) console.log({ err });
      this._nzNotificationSvc.error('User info not found', 'There was not found any user info');
      return this._router.navigateByUrl(`/${RoutesApp.dashboard}`);
    }

    return this._authSvc.userState().subscribe(userInfo => {

      if ( !userInfo ) return notFindUser();

      console.log({ userInfo });
      const { email } = userInfo
      return this._usersSvc.getFilteredUsers({email}).subscribe(users => {
        console.log({ users });
        if ( users.length < 1 ) return notFindUser()
          this.user = users[0];
        const { names, lastnames, email, password, role, state } = this.user;
        return this.form.patchValue({ names, lastnames, email, password, role, state });
      }, err => notFindUser(err));
    }, err => notFindUser(err))
  }

  public letters(word: string): string[] {
    return word.split('');
  }
  
  public getControlErrors(control: string): Array<string> {
    return Object.keys(this.form.get(control)?.errors ?? {});
  }

  public submit(): void {
    console.log({ form: this.form });
  }

}
