import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ModulesService } from '../modules.service';
import { ControlTypes, localStorageLabels, RoutesApp } from '../../../../../enums';
import { IModule, IUFControl } from '../../../../../interfaces';

import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
@Component({
  selector: 'app-add-module',
  imports: [RouterLink, ReactiveFormsModule, NzPopoverModule, NzSwitchModule],
  templateUrl: './add-module.component.html',
  styleUrl: './add-module.component.css'
})
export class AddModuleComponent {

  public backTo: string = `/${RoutesApp.modules}`;

  public form: FormGroup;
  public showErrors: boolean = false;

  public module: IModule | null = null;

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
      // {
      //   title: this.en ? 'Role' : 'Rol',
      //   name: 'role',
      //   type: ControlTypes.select,
      //   options: this.roles.map((role) => ({
      //     label: role.name,
      //     value: role.id,
      //   })),
      //   invalid: this.en
      //     ? 'Please enter a valid name between 2 and 30 characters long.'
      //     : 'Ingrese un nombre válido de entre 2 y 30 caracteres.',
      // },
      {
        title: this.en ? 'Label' : 'Etiqueta',
        name: 'label',
        type: ControlTypes.group,
        // invalid: this.en
        //   ? 'Please enter a valid label.'
        //   : 'Por favor ingrese una etiqueta valida.',
        controls: [
          {
            title: this.en ? 'English' : 'Inglés',
            name: 'en',
            type: ControlTypes.text,
            invalid: this.en
              ? 'Please enter a valid English label.'
              : 'Por favor ingrese una etiqueta valida en Inglés.',
          },
          {
            title: this.en ? 'Spanish' : 'Español',
            name: 'es',
            type: ControlTypes.text,
            invalid: this.en
              ? 'Please enter a valid Spanish label.'
              : 'Por favor ingrese una etiqueta valida en Español.',
          },
        ],
      },
      {
        title: this.en ? 'Title' : 'Título',
        name: 'title',
        type: ControlTypes.group,
        // invalid: this.en
        //   ? 'Please enter a valid title.'
        //   : 'Por favor ingrese un título valido.',
        controls: [
          {
            title: this.en ? 'English' : 'Inglés',
            name: 'en',
            type: ControlTypes.text,
            invalid: this.en
              ? 'Please enter a valid English title.'
              : 'Por favor ingrese un título valido en Inglés.',
          },
          {
            title: this.en ? 'Spanish' : 'Español',
            name: 'es',
            type: ControlTypes.text,
            invalid: this.en
              ? 'Please enter a valid Spanish title.'
              : 'Por favor ingrese un título valido en Español.',
          },
        ],
      },
      {
        title: this.en ? 'Route' : 'Ruta',
        name: 'route',
        type: ControlTypes.text,
        invalid: this.en
          ? 'Please enter a valid route.'
          : 'Por favor ingrese una ruta valida.',
      },
      {
        title: this.en ? 'Icon' : 'Icono',
        name: 'icon',
        type: ControlTypes.text,
        invalid: this.en
          ? 'Please enter a valid icon.'
          : 'Por favor ingrese un icono valido.',
      },
      {
        title: this.en ? 'Description' : 'Descripción',
        name: 'description',
        type: ControlTypes.textarea,
        invalid: this.en
          ? 'Please enter a valid description. (Max 200 characters)'
          : 'Por favor ingrese una descripción valida. (Máx 200 caracteres)',
      },
    ];
  }

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _modulesSvc: ModulesService,
    private _nzNotificationSvc: NzNotificationService,
  ) {
    localStorage.removeItem(localStorageLabels.loading);
    this.form = this._fb.group({
      label: this._fb.group({
        en: ['', [Validators.required]],
        es: ['', [Validators.required]],
      }),
      title: this._fb.group({
        en: ['', [Validators.required]],
        es: ['', [Validators.required]],
      }),
      route: ['', [Validators.required]],
      icon: ['', [Validators.required]],
      description: ['', [Validators.maxLength(200)]],
      state: [true],
      // createdAt: Date | any,
      // lastUpdate: Date | any,
    });

    const id = this._route.snapshot.paramMap.get('id');
    if (id) this.getModule(id);
  }

  public isRequired(c: string, sub?: string): boolean {
    if (sub) {
      return this.form.controls[c]?.get(sub)?.hasValidator(Validators.required) ?? false;
    }
    return this.form.controls[c].hasValidator(Validators.required);
  }

  public getControlErrors(control: string, sub?: string): Array<string> {
    if (sub) {
      return Object.keys(this.form.get(control)?.get(sub)?.errors ?? {});
    }
    return Object.keys(this.form.get(control)?.errors ?? {});
  }

  public letters(w: string): string[] {
    return w.split('');
  }

  public formPatch(r: IModule): void {
    const { label, title, route, icon, description, state } = r;
    return this.form.patchValue({ label, title, route, icon, description, state });
  }

  public getModule(id: string): Subscription {
    return this._modulesSvc.getModule(id).subscribe(
      module => {
        // console.log({ module });
        if (typeof module === 'undefined') {
          const msg: string = 'The provided Id did not match any module in the DB';
          console.error(msg, 404);
          this.error(msg);

          return this._router.navigateByUrl(`/${RoutesApp.modules}`)
        }
        this.formPatch(module);
        return this.module = module;
      }, error => console.error({ error })
    );
  }

  public invalidForm(): NzNotificationRef {
    this.showErrors = true;
    return this._nzNotificationSvc.warning('Invalid Form', 'The form is not valid, please check out the values.');
  };

  public successful(edit?: boolean): NzNotificationRef {
    return this._nzNotificationSvc.success(`Successful ${edit ? 'Edition' : 'Registration'}`, `The module was ${edit ? 'edited' : 'registered'} successfully.`);
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
    if (this.module) {
      const { id, createdAt } = this.module;
      const body = { ...value, createdAt, lastUpdate: Date.now() };
      return this._modulesSvc.updateModule(id, body)
        .then(
          response => {
            // console.log({ response });
            const selectedList: Array<IModule> = JSON.parse(localStorage.getItem(localStorageLabels.module.selectedList) ?? '[]');

            if (selectedList.length > 0) {
              const selectedItemIndex: number = selectedList.findIndex(item => item.id === id);
              if (selectedItemIndex >= 0) {
                selectedList[selectedItemIndex] = { ...selectedList[selectedItemIndex], ...body };
                localStorage.setItem(localStorageLabels.module.selectedList, JSON.stringify(selectedList));
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
    return this._modulesSvc.addModule({ ...value, createdAt: d, lastUpdate: d })
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
