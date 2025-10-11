import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { localStorageLabels, RoutesApp } from '../../../../../../enums';
import { IFilterFormField } from '../../../../../../interfaces/filter-form-field.interface';

import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-filters',
  imports: [ReactiveFormsModule, NzSelectModule],
  template: `
    <!-- <p>filters works!</p> -->

    <div class="container">
      <header class="header">
        <h5 class="title">Filters</h5>
      </header>

      <form [formGroup]="form" (ngSubmit)="submit()" class="form">
        @for (item of filterFormFields; track item.key) { @if (item.type ===
        'multiselect') {
        <div class="multiselect_div">
          <span>{{ item.label }}</span>
          <nz-select
            class="select"
            nzMode="multiple"
            [nzPlaceHolder]="item.placeholder ?? ''"
            [formControlName]="item.key"
          >
            @for (item of item.selectOptions; track item) {
            <nz-option [nzLabel]="item.name" [nzValue]="item.id"></nz-option>
            }
          </nz-select>
        </div>
        } @else {
        <label class="label">
          <span>{{ item.label }}</span>
          <input
            [type]="item.type"
            class="input"
            [placeholder]="item.placeholder"
            [formControlName]="item.key"
          />
        </label>
        } }
        <button type="submit" title="Apply Filter" class="button submit_button">
          Filter
        </button>
      </form>
    </div>
  `,
  styles: [
    `
      .container {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 30px;
        padding: 20px;
        background-color: var(--secondary);
        color: var(--primary);
        border-radius: 10px;
      }

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

      .subForm {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;
      }

      .label,
      .multiselect_div {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .input,
      select,
      button {
        width: 100%;
        border: none;
        outline: none;
        color: var(--secondary);
        border-radius: 5px;
        padding: 4px 8px;
      }

      button {
        margin-top: 20px;
        background-color: var(--accent);

        &:hover {
          transform: scale(105%);
        }
      }
    `,
  ],
})
export class FiltersComponent implements OnInit {
  @Output() valueFormEmitter: EventEmitter<any> = new EventEmitter();
  @Input() filterFormFields: Array<IFilterFormField> = [];

  public form: FormGroup;

  public get actualLabel(): string {
    return this._router.url.split('/')[1] === RoutesApp.elementsToPractice
      ? localStorageLabels.etp.filerBody
      : localStorageLabels.pl.filerBody;
  }

  constructor(private _fb: FormBuilder, private _router: Router) {
    this.form = this._fb.group({});
  }

  ngOnInit(): void {
    this.initForm();
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
      console.log({ item });
      group.addControl(
        item.key,
        this._fb.control(
          item.type !== 'multiselect'
            ? item.intialValue ?? this.getfieldType(item)
            : []
        )
      );
    });

    console.log({ group });

    return group;
  }

  public initForm(): void {
    this.form = this.buildForm(this.filterFormFields);
    const filerBodyForm = JSON.parse(
      localStorage.getItem(this.actualLabel) ?? 'null'
    );
    if (filerBodyForm) this.form.patchValue(filerBodyForm);
    console.log({ form: this.form });
  }

  public submit(): void {
    console.log({ filterForm: this.form });

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
    this.valueFormEmitter.emit(formValue);
  }
}
