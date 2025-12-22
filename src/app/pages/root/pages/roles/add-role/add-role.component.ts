import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { RolesService } from '../roles.service';
import { localStorageLabels, RoutesApp } from '../../../../../enums';
import { IModule, IRole } from '../../../../../interfaces';

import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { ModulesService } from '../../modules';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-add-role',
  imports: [RouterLink, ReactiveFormsModule, NzPopoverModule, NzSwitchModule, NzSelectModule],
  templateUrl: './add-role.component.html',
  styleUrl: './add-role.component.css'
})
export class AddRoleComponent implements OnInit {

  public backTo: string = `/${RoutesApp.roles}`;

  public form: FormGroup;
  public showErrors: boolean = false;

  public role: IRole | null = null;
  public modules: IModule[] = [];

  get localLanguage(): string {
    return localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en';
  }

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _rolesSvc: RolesService,
    private _modulesSvc: ModulesService,
    private _nzNotificationSvc: NzNotificationService,
  ) {
    localStorage.removeItem(localStorageLabels.loading);
    this.form = this._fb.group({
      name: ['', [Validators.required, Validators.maxLength(60)]],
      description: ['', [Validators.maxLength(200)]],
      assignedModules: [[], [Validators.required]],
      state: [true],
      // createdAt: Date | any,
      // lastUpdate: Date | any,
    });

    const id = this._route.snapshot.paramMap.get('id');
    if (id) this.getRole(id);
  }

  ngOnInit(): void {
    this.getModules();
  }

  public getModules(): void {
    this._modulesSvc.getModules().subscribe(modules => {
      // console.log({ modules });

      // this.form.patchValue({ assignedModules: modules });
      this.modules = modules;
    }, error => console.error({ error }));
  }

  public isRequired(control: string): boolean {
    return this.form.controls[control].hasValidator(Validators.required);
  }

  public getControlErrors(control: string): Array<string> {
    return Object.keys(this.form.get(control)?.errors ?? {});
  }

  public letters(w: string): string[] {
    return w.split('');
  }

  public formPatch(r: IRole): void {
    // const { name, description, state } = r;
    return this.form.patchValue(r);
  }

  public getRole(id: string): Subscription {
    return this._rolesSvc.getRole(id, true).subscribe(
      role => {
        // console.log({ role });
        if (typeof role === 'undefined') {
          const msg: string = 'The provided Id did not match any role in the DB';
          console.error(msg, 404);
          this.error(msg);

          return this._router.navigateByUrl(`/${RoutesApp.roles}`)
        }
        this.formPatch(role);
        return this.role = role;
      }, error => console.error({ error })
    );
  }

  public invalidForm(): NzNotificationRef {
    this.showErrors = true;
    return this._nzNotificationSvc.warning('Invalid Form', 'The form is not valid, please check out the values.');
  };

  public successful(edit?: boolean): NzNotificationRef {
    return this._nzNotificationSvc.success(`Successful ${edit ? 'Edition' : 'Registration'}`, `The Role was ${edit ? 'edited' : 'registered'} successfully.`);
  };

  public error(msg?: string): NzNotificationRef {
    return this._nzNotificationSvc.error('Error', msg ?? 'Something went wrong so we were not able to complete the proccess, please try again.');
  };

  public submit(): void | NzNotificationRef | Promise<void> {

    // console.log({ form: this.form });

    if (!this.form.valid) return this.invalidForm();

    const { value } = this.form;

    const { loading } = localStorageLabels;
    localStorage.setItem(loading, loading)
    if (this.role) {
      const { id, createdAt } = this.role;
      const body = { ...value, createdAt, lastUpdate: Date.now() };
      return this._rolesSvc.updateRole(id, body)
        .then(
          response => {
            // console.log({ response });
            const selectedList: Array<IRole> = JSON.parse(localStorage.getItem(localStorageLabels.role.selectedList) ?? '[]');

            if (selectedList.length > 0) {
              const selectedItemIndex: number = selectedList.findIndex(item => item.id === id);
              if (selectedItemIndex >= 0) {
                selectedList[selectedItemIndex] = { ...selectedList[selectedItemIndex], ...body };
                localStorage.setItem(localStorageLabels.role.selectedList, JSON.stringify(selectedList));
              }
            }
            this.successful(true);
          }
        )
        .catch(
          error => {
            console.log({ error });
            this.error();
          }
        ).finally(() => localStorage.removeItem(loading));
    }

    const d: number = Date.now();
    return this._rolesSvc.addRole({ ...value, createdAt: d, lastUpdate: d })
      .then(
        response => {
          // console.log({ response });
          this.successful();
        }
      )
      .catch(
        error => {
          console.log({ error });
          this.error();
        }
      )
      .finally(() => {
        this.form.reset();
        this.form.get('state')?.setValue(true);
        localStorage.removeItem(loading);
      });
  }

}
