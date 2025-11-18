import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';

import {
  ControlTypes,
  localStorageLabels,
  RoutesApp,
} from '../../../../../enums';
import { IRole, IUFControl, IUser } from '../../../../../interfaces';

import { UsersService } from '../users.service';
import { validateComplexPassword } from '../../../../auth';

import {
  NzNotificationRef,
  NzNotificationService,
} from 'ng-zorro-antd/notification';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { RolesService } from '../../roles';

@Component({
  selector: 'app-add-user',
  imports: [RouterLink, ReactiveFormsModule, NzPopoverModule, NzSwitchModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css',
})
export class AddUserComponent implements OnInit {
  public backTo: string = `/${RoutesApp.users}`;

  public form: FormGroup;
  public showErrors: boolean = false;
  public showPassword: boolean = false;

  public user: IUser | null = null;

  public roles: IRole[] = [];

  get localLanguage(): string {
    return (
      localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en'
    );
  }

  get en(): boolean {
    return this.localLanguage === 'en';
  }

  get controls(): IUFControl[] {
    return [
      {
        title: this.en ? 'Role' : 'Rol',
        name: 'role',
        type: ControlTypes.select,
        options: this.roles.map((role) => ({
          label: role.name,
          value: role.id,
        })),
        invalid: this.en
          ? 'Please enter a valid name between 2 and 30 characters long.'
          : 'Ingrese un nombre válido de entre 2 y 30 caracteres.',
      },
      {
        title: this.en ? 'Names' : 'Nombres',
        name: 'names',
        type: ControlTypes.text,
        invalid: this.en
          ? 'Please enter a valid name between 2 and 30 characters long.'
          : 'Ingrese un nombre válido de entre 2 y 30 caracteres.',
      },
      {
        title: this.en ? 'Last names' : 'Apellidos',
        name: 'lastnames',
        type: ControlTypes.text,
        invalid: this.en
          ? 'Please enter a valid lastname between 2 and 30 characters long.'
          : 'Ingrese un apellido válido de entre 2 y 30 caracteres.',
      },
      {
        title: this.en ? 'Email' : 'Correo',
        name: 'email',
        type: ControlTypes.email,
        invalid: this.en
          ? 'Please enter a valid email with a maximum of 30 characters.'
          : 'Por favor ingrese un correo valido con un maximo de 30 caracteres',
      },
      {
        title: this.en ? 'Password' : 'Contraseña',
        name: 'password',
        type: ControlTypes.password,
        invalid: this.en
          ? 'Please enter a password that is between 6 and 20 characters long, contains one uppercase letter, one lowercase letter, one number, and one special character.'
          : 'Por favor ingrese una contraseña valida que tenga entre 6 y 20 caracteres de largo, que contenga almenos una letra mayuscula, una minuscula, un número y un caracter especial',
      },
    ];
  }

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _usersSvc: UsersService,
    private _rolesSvc: RolesService,
    private _nzNotificationSvc: NzNotificationService
  ) {
    localStorage.removeItem(localStorageLabels.loading);
    this.form = this._fb.group({
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(30)],
      ],
      names: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30),
        ],
      ],
      lastnames: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          validateComplexPassword(),
          Validators.maxLength(20),
        ],
      ],
      role: ['0DVyrvO2rmDJZ6MoNBgv'],
      state: [true],
      // createdAt: Date | any,
      // lastUpdate: Date | any,
    });

    const id = this._route.snapshot.paramMap.get('id');
    if (id) this.getUser(id);
  }

  ngOnInit(): void {
    this.getRoles()
  }

  public getRoles(): Subscription {
    return this._rolesSvc.getRoles().subscribe(
      (roles) => {
        console.log({ roles });
        this.roles = roles;
      },
      (error) => console.error({ error })
    );
  }

  public isRequired(cn: string): boolean {
    return this.form.controls[cn].hasValidator(Validators.required);
  }

  public getControlErrors(control: string): Array<string> {
    return Object.keys(this.form.get(control)?.errors ?? {});
  }

  public letters(w: string): string[] {
    return w.split('');
  }

  public formPatch(u: IUser): void {
    const { email, names, lastnames, password, role, state } = u;

    return this.form.patchValue({
      email,
      names,
      lastnames,
      password,
      role,
      state,
    });
  }

  public getUser(id: string): Subscription {
    return this._usersSvc.getUser(id, true).subscribe(
      (user) => {
        console.log({ user });
        if (typeof user === 'undefined') {
          const msg: string =
            'The provided Id did not match any user in the DB';
          console.error(msg, 404);
          this.error(msg);

          return this._router.navigateByUrl(`/${RoutesApp.users}`);
        }
        this.formPatch(user);
        return (this.user = user);
      },
      (error) => console.error({ error })
    );
  }

  public invalidForm(): NzNotificationRef {
    this.showErrors = true;
    return this._nzNotificationSvc.warning(
      'Invalid Form',
      'The form is not valid, please check out the values.'
    );
  }

  public successful(edit?: boolean): NzNotificationRef {
    return this._nzNotificationSvc.success(
      `Successful ${edit ? 'Edition' : 'Registration'}`,
      `The user was ${edit ? 'edited' : 'registered'} successfully.`
    );
  }

  public error(msg?: string): NzNotificationRef {
    return this._nzNotificationSvc.error(
      'Error',
      msg ??
      'Something went wrong so we were not able to complete the proccess, please try again.'
    );
  }

  public submit(): void | NzNotificationRef | Promise<void> {
    console.log({ form: this.form });

    if (!this.form.valid) return this.invalidForm();

    const { value } = this.form;

    const { loading } = localStorageLabels;
    localStorage.setItem(loading, loading);
    if (this.user) {
      const { id, createdAt } = this.user;
      const body = { ...value, createdAt, lastUpdate: Date.now() };
      return this._usersSvc
        .updateUser(id, body)
        .then((response) => {
          console.log({ response });
          const selectedList: Array<IUser> = JSON.parse(
            localStorage.getItem(localStorageLabels.user.selectedList) ?? '[]'
          );

          if (selectedList.length > 0) {
            const selectedItemIndex: number = selectedList.findIndex(
              (item) => item.id === id
            );
            if (selectedItemIndex >= 0) {
              selectedList[selectedItemIndex] = {
                ...selectedList[selectedItemIndex],
                ...body,
              };
              localStorage.setItem(
                localStorageLabels.user.selectedList,
                JSON.stringify(selectedList)
              );
            }
          }
          this.successful(true);
        })
        .catch((error) => {
          console.log({ error });
          this.error();
        })
        .finally(() => localStorage.removeItem(loading));
    }

    const d: number = Date.now();
    return this._usersSvc
      .addUser({ ...value, createdAt: d, lastUpdate: d })
      .then((response) => {
        console.log({ response });
        this.successful();
      })
      .catch((error) => {
        console.log({ error });
        this.error();
      })
      .finally(() => {
        this.form.reset();
        this.form.get('state')?.setValue(true);
        localStorage.removeItem(loading);
      });
  }
}
