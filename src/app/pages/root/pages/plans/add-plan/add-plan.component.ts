import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { PlansService } from '../plans.service';
import { ControlTypes, localStorageLabels, RoutesApp } from '../../../../../enums';
import { IPlan, IUFControl } from '../../../../../interfaces';

import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

@Component({
  selector: 'app-add-plan',
  imports: [RouterLink, ReactiveFormsModule, NzPopoverModule, NzSwitchModule],
  templateUrl: './add-plan.component.html',
  styleUrl: './add-plan.component.css'
})
export class AddPlanComponent {

  public backTo: string = `/${RoutesApp.plans}`;

  public form: FormGroup;
  public showErrors: boolean = false;

  public plan: IPlan | null = null;

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
        title: this.en ? 'Title' : 'Título',
        name: 'title',
        type: ControlTypes.group,
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
        title: this.en ? 'Description' : 'Titulo',
        name: 'description',
        type: ControlTypes.group,
        controls: [
          {
            title: this.en ? 'English' : 'Inglés',
            name: 'en',
            type: ControlTypes.text,
            invalid: this.en
              ? 'Please enter a valid English description.'
              : 'Por favor ingrese una descripción valida en Inglés.',
          },
          {
            title: this.en ? 'Spanish' : 'Español',
            name: 'es',
            type: ControlTypes.text,
            invalid: this.en
              ? 'Please enter a valid Spanish description.'
              : 'Por favor ingrese una descripción valida en Español.',
          },
        ],
      },
      {
        title: this.en ? 'Price' : 'Precio',
        name: 'price',
        type: ControlTypes.number,
        invalid: this.en
          ? 'Please enter a valid price.'
          : 'Por favor ingrese un precio valido.',
      },
      {
        title: this.en ? 'features' : 'Caracteristicas',
        name: 'features',
        type: ControlTypes.controlArray,
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
        ]
      },
      // {
      //   title: this.en ? 'Icon' : 'Icono',
      //   name: 'icon',
      //   type: ControlTypes.text,
      //   invalid: this.en
      //     ? 'Please enter a valid icon.'
      //     : 'Por favor ingrese un icono valido.',
      // },
      // {
      //   title: this.en ? 'Description' : 'Descripción',
      //   name: 'description',
      //   type: ControlTypes.textarea,
      //   invalid: this.en
      //     ? 'Please enter a valid description. (Max 200 characters)'
      //     : 'Por favor ingrese una descripción valida. (Máx 200 caracteres)',
      // },
    ];
  }

  get features(): FormArray {
    return this.form.get('features') as FormArray;
  }

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _plansSvc: PlansService,
    private _nzNotificationSvc: NzNotificationService,
  ) {
    localStorage.removeItem(localStorageLabels.loading);
    const enes = this._fb.group({
      en: ['', [Validators.required]],
      es: ['', [Validators.required]],
    })
    this.form = this._fb.group({
      title: enes,
      description: enes,
      price: [0, [Validators.required, Validators.min(0)]],
      features: this._fb.array([enes]),
      state: [true],
    });

    const id = this._route.snapshot.paramMap.get('id');
    if (id) this.getplan(id);
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

  public formPatch(r: IPlan): void {
    const { title, description, price, state } = r;
    return this.form.patchValue({ title, price, description, state });
  }

  public getplan(id: string): Subscription {
    return this._plansSvc.getPlan(id).subscribe(
      plan => {
        // console.log({ plan });
        if (typeof plan === 'undefined') {
          const msg: string = 'The provided Id did not match any plan in the DB';
          console.error(msg, 404);
          this.error(msg);

          return this._router.navigateByUrl(`/${RoutesApp.plans}`)
        }
        this.formPatch(plan);
        return this.plan = plan;
      }, error => console.error({ error })
    );
  }

  public invalidForm(): NzNotificationRef {
    this.showErrors = true;
    return this._nzNotificationSvc.warning('Invalid Form', 'The form is not valid, please check out the values.');
  };

  public successful(edit?: boolean): NzNotificationRef {
    return this._nzNotificationSvc.success(`Successful ${edit ? 'Edition' : 'Registration'}`, `The plan was ${edit ? 'edited' : 'registered'} successfully.`);
  };

  public error(msg?: string): NzNotificationRef {
    return this._nzNotificationSvc.error('Error', msg ?? 'Something went wrong so we were not able to complete the proccess, please try again.');
  };

  public newFeature(val?: { en: string, es: string }): FormGroup {
    // return new FormControl(val ?? '', [Validators.required]);
    const feature: FormGroup = this._fb.group({
      en: ['', [Validators.required]],
      es: ['', [Validators.required]],
    })
    if (val) feature.patchValue({ ...val });
    return feature;
  }

  public addFeature(): void {
    this.features.push(this.newFeature());
  }

  public removeFeature(i: number): void {

    return this.features.removeAt(i);
  }

  public submit(): void | NzNotificationRef | Promise<void> {

    // console.log({ form: this.form });

    if (!this.form.valid) return this.invalidForm();

    const { value } = this.form;

    const { loading } = localStorageLabels;
    localStorage.setItem(loading, loading)
    if (this.plan) {
      const { id, createdAt } = this.plan;
      const body = { ...value, createdAt, lastUpdate: Date.now() };
      return this._plansSvc.updatePlan(id, body)
        .then(
          response => {
            // console.log({ response });
            const selectedList: Array<IPlan> = JSON.parse(localStorage.getItem(localStorageLabels.plan.selectedList) ?? '[]');

            if (selectedList.length > 0) {
              const selectedItemIndex: number = selectedList.findIndex(item => item.id === id);
              if (selectedItemIndex >= 0) {
                selectedList[selectedItemIndex] = { ...selectedList[selectedItemIndex], ...body };
                localStorage.setItem(localStorageLabels.plan.selectedList, JSON.stringify(selectedList));
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
    return this._plansSvc.addPlan({ ...value, createdAt: d, lastUpdate: d })
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
