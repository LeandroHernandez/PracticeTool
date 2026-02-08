import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { localStorageLabels, RoutesApp, typesOfElementsToPractice } from '../../../../../../enums';
import { IFilterFormField } from '../../../../../../interfaces/filter-form-field.interface';

import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-filters',
  imports: [ReactiveFormsModule, NzSelectModule],
  template: `
    <!-- <p>filters works!</p> -->

    <form [formGroup]="form" (ngSubmit)="submit()" class="form">
      <header class="form-header">
        <h5 class="title">Filters</h5>
      </header>
      <fieldset class="fieldset">
        @for (item of filterFormFields; track item.key) {
          <!-- @if (item.key != 'selectedUses' || item.key === 'selectedUses' && includeWord) { -->
            <div class="input-box">
              @if (item.type === 'multiselect') {
                <label class="label-input">
                  <div class="span-label-div">
                    @for (letter of letters( item.placeholder ?? ''); track $index) {
                      <span class="span-letter" [style.--i]="$index"> {{letter}} </span>
                    }
                  </div>
                  <nz-select
                    [class]=" form.controls[item.key].value.length > 0 ? 'multiselect with-content' : 'multiselect'"
                    nzMode="multiple"
                    nzPlaceHolder=""
                    [formControlName]="item.key"
                  >
                  @for (item of item.selectOptions; track item) {
                    <nz-option [nzLabel]="item.name" [nzValue]="item.id"></nz-option>
                  }
                </nz-select>
              </label>
              } @else {
            <label class="label-input">
              <div class="span-label-div">
                @for (letter of letters( item.placeholder ?? ''); track $index) {
                  <span class="span-letter" [style.--i]="$index"> {{letter}} </span>
                }
              </div>
              <input
                [type]="item.type"
                class="input"
                placeholder=""
                [formControlName]="item.key"
              />
            </label>
            } 
            </div>
          <!-- }  -->
      }
      </fieldset>
      <button type="submit" title="Apply Filter" class="button-submit">
        Filter
      </button>
    </form>
  `,
  styles: [
    `
      .title {
        color: var(--accent);
        font-size: 20px;
      }

      .form {
        width: 100%;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 20px;
      }

      .span-letter {
        background-color: white;
      }
    `,
  ],
})
export class FiltersComponent implements OnInit {
  @Output() valueFormEmitter: EventEmitter<any> = new EventEmitter();
  @Input() filterFormFields: Array<IFilterFormField> = [];

  public form: FormGroup;

  get actualLabel(): string {
    return this._router.url.split('/')[1] === RoutesApp.elementsToPractice
      ? localStorageLabels.etp.filerBody
      : localStorageLabels.pl.filerBody;
  }

  get language(): string {
    const res: string = localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en';
    return res;
  }

  // get includeWord(): boolean {
  //   return this.form.controls['type'].value.includes(typesOfElementsToPractice.word);
  // }

  constructor(private _fb: FormBuilder, private _router: Router) {
    this.form = this._fb.group({});
  }

  ngOnInit(): void {
    this.initForm();
  }

  public letters(w: string): string[] {
    return w.split('');
  }

  public getfieldType(item: IFilterFormField): number | boolean | string {
    if (item.key === 'number') {
      return 0;
    } else if (item.key === 'switch' || item.key === 'irregular') {
      return false;
    } else {
      return '';
    }
  }

  public buildForm(items: Array<IFilterFormField>): FormGroup {
    const group: FormGroup = this._fb.group({});

    items.forEach((item) => {
      // console.log({ item });
      group.addControl(
        item.key,
        this._fb.control(
          item.type !== 'multiselect'
            ? item.intialValue ?? this.getfieldType(item)
            : []
        )
      );
    });

    // console.log({ group });

    return group;
  }

  public initForm(): void {
    console.log({ filterFormFields: this.filterFormFields });
    this.form = this.buildForm(this.filterFormFields);
    let filterBodyForm = JSON.parse(
      localStorage.getItem(this.actualLabel) ?? 'null'
    );
    // if (filterBodyForm) this.form.patchValue(filterBodyForm);
    if (!filterBodyForm) return;
    if (this.actualLabel === localStorageLabels.etp.filerBody) {
      const type: string[] = []
      const selectedUses: string[] = []
      filterBodyForm.type?.forEach((tId: string) => {
        const { selectOptions } = this.filterFormFields[2];
        if (selectOptions && selectOptions.findIndex(
          (option: { name: string, id: string }) =>
            option.id === tId
        ) >= 0) {
          selectedUses.push(tId);
        } else type.push(tId);
      });
      filterBodyForm.type = type;
      filterBodyForm.selectedUses = selectedUses;
    }
    this.form.patchValue(filterBodyForm);
    // console.log({ form: this.form });
  }

  public submit(): void {
    // console.log({ filterForm: this.form });

    const formValue: any = {};
    const { value } = this.form;
    if (value.selectedUses) {
      value.type = value.type.concat(value.selectedUses);
      delete value.selectedUses;
    }
    Object.keys(value).forEach((key) =>
      value[key].length > 0 ? (formValue[key] = value[key]) : false
    );
    if (Object.keys(formValue).length > 0) {
      localStorage.setItem(this.actualLabel, JSON.stringify(formValue));
    } else {
      localStorage.removeItem(this.actualLabel);
    }
    console.log({ formValue: JSON.stringify(formValue) });
    this.valueFormEmitter.emit(formValue);
  }
}
