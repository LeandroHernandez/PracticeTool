import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { UsersService } from '../users';
import { AuthService, validateComplexPassword } from '../../../auth';

import { localStorageLabels, RoutesApp } from '../../../../enums';
import { IUser } from '../../../../interfaces';

import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzIconModule } from 'ng-zorro-antd/icon';
// import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

import { DateTime } from 'luxon';
import { Timestamp } from 'firebase/firestore';
// import { IPlan } from '../../../../interfaces/plan.interface';
import { PlansService } from '../plans';


@Component({
  selector: 'app-profile',
  // imports: [ReactiveFormsModule, NzPopoverModule, NzIconModule, NzCalendarModule],
  imports: [ReactiveFormsModule, NzPopoverModule, NzIconModule, NzDatePickerModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})

export class ProfileComponent implements OnInit {

  public user: IUser | null = null;
  public form: FormGroup;
  // public plans: IPlan[] = [];

  public showErrors: boolean = false;
  public showPassword: boolean = false;

  public visible: boolean = false;
  public age: number = 0;

  get en(): boolean {
    const en = localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en';
    return en === 'en';
  }

  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _authSvc: AuthService,
    private _usersSvc: UsersService,
    // private _plansSvc: PlansService,
    private _nzNotificationSvc: NzNotificationService
  ) {
    this.form = this._fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(30)]],
      names: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      gender: ['', [Validators.required, Validators.maxLength(20)]],
      lastnames: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      password: ['', [Validators.required, Validators.minLength(6), validateComplexPassword(), Validators.maxLength(20)]],
      role: [''],
      monthlyObjective: this._fb.group({
        etps: [30, [Validators.required, Validators.min(30)]],
        lists: [4, [Validators.required, Validators.min(4)]]
      }),
      // createdAt: [],
      // lastUpdate: [new Date],
      state: []
    });

    this.form.get('email')?.disable();
    this.form.get('role')?.disable();

    this.form.get('age')?.valueChanges.subscribe(value => {
      console.log({ value });
      this.ageCalculator(value);
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

      if (!userInfo) return notFindUser();

      // console.log({ userInfo });
      const { email } = userInfo
      return this._usersSvc.getFilteredUsers({ email }).subscribe(users => {
        if (users.length < 1) return notFindUser()
        this.user = users[0];
        console.log({ user: this.user });
        // this._plansSvc.getFilteredPlans().subscribe(plans => {
        //   // console.log({ plan });
        //   // this.plans.push(plan);
        //   console.log({ plans });
        //   this.plans = plans;
        // }, err => console.log({ err }));
        const user: any = { ...this.user };
        if (user.id) delete user.id;
        if (user.createdAt) delete user.createdAt;
        if (user.lastUpdate) delete user.lastUpdate;
        const { age, role } = user
        return this.form.patchValue({ ...user, age: age?.toDate(), role: role?.id });
      }, err => notFindUser(err));
    }, err => notFindUser(err))
  }

  public letters(word: string): string[] {
    return word.split('');
  }

  public getControlErrors(control: string): Array<string> {
    return Object.keys(this.form.get(control)?.errors ?? {});
  }

  public disabledDate = (current: Date): boolean => {
    const today = DateTime.now();
    const minDate = today.minus({ years: 120 });

    const currentDate = DateTime.fromJSDate(current);

    return currentDate > today || currentDate < minDate;
  };

  public onValueChange(event: any): void {
    console.log({ event });
    this.ageCalculator(event);
    // this.visible = false;
  }

  public ageCalculator(fechaNacimiento: Date): number {
    const birthDate = DateTime.fromJSDate(fechaNacimiento);

    const now = DateTime.now();

    const edad = now.diff(birthDate, 'years').years;

    return this.age = Math.floor(edad);
  }

  public submit(): NzNotificationRef | Promise<NzNotificationRef> {
    console.log({ form: this.form });
    if (!this.user) return this._nzNotificationSvc.error('User info not found', 'There was not found any user info');
    if (this.form.invalid) {
      this.showErrors = true;
      return this._nzNotificationSvc.warning('Invalid form', 'Please fill all the fields correctly');
    }
    return this._usersSvc.updateUser(this.user.id, { ...this.form.value }).then(() => {
      return this._nzNotificationSvc.success('Profile updated', 'Your profile has been updated successfully');
    }).catch(err => {
      console.log({ err });
      return this._nzNotificationSvc.error('Error updating profile', 'There was an error updating your profile, please try again');
    });
  }

  public selectPlan(id: string): void {
    console.log({ id });
  }

}
