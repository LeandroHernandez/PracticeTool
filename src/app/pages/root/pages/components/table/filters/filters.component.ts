import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IFilterFormField } from '../../../../../../interfaces/filter-form-field.interface';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Router } from '@angular/router';
import { localStorageLabels, RoutesApp } from '../../../../../../enums';

@Component({
  selector: 'app-filters',
  imports: [ReactiveFormsModule, NzSelectModule],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css',
})
export class FiltersComponent implements OnInit {
  @Output() valueFormEmitter: EventEmitter<any> = new EventEmitter();
  @Input() filterFormFields: Array<IFilterFormField> = [];

  // public activeForm: FormGroup;
  public form: FormGroup;

  public get actualLabel(): string {
    return this._router.url.split('/')[1] === RoutesApp.elementsToPractice ? localStorageLabels.etp.filerBody : localStorageLabels.pl.filerBody;
  }

  // public get activeFilters(): boolean {
  //   return this.activeForm.controls['activeFilters'].value;
  // };

  constructor(private _fb: FormBuilder, private _router: Router) {
    // this.activeForm = this._fb.group({
    //   activeFilters: [ false ]
    // });
    this.form = this._fb.group({});
  }

  ngOnInit(): void {
    this.initForm();
    // this.form.valueChanges.subscribe(value => {
    //   this.valueFormEmitter.emit( this.activeFilters ? value : null);
    // });
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
      // return group.addControl(item.key, item.type !=='subForm' ? [ this.getfieldType(item) ] : this.buildForm(item.subForm ?? []));
      group.addControl(
        item.key,
        // item.type !== 'subForm'
        //   ? this._fb.control(item.intialValue ?? this.getfieldType(item))
        //   : this.buildForm(item.subForm ?? [])
        this._fb.control(item.type !== 'multiselect' ? item.intialValue ?? this.getfieldType(item) : [])
      );
    });

    console.log({ group });

    return group;
  }

  public initForm(): void {
    this.form = this.buildForm(this.filterFormFields);
    const filerBodyForm = JSON.parse(localStorage.getItem(this.actualLabel) ?? 'null');
    if (filerBodyForm) this.form.patchValue(filerBodyForm);
    console.log({ form: this.form });
    // this.form.disable();
  }

  // public changeActiveFilters(): void {

  //   console.log({activeFilters: this.activeFilters})

  //   if (!this.activeFilters) {
  //     return this.form.disable()
  //   }

  //   return this.form.enable();
  // }

  public submit(): void {
    // const irregular = this.form.get('verbInfo')?.get('irregular');
    // this.form
    //   .get('verbInfo')
    //   ?.get('irregular')
    //   ?.patchValue(
    //     irregular && irregular.value !== '' ? JSON.parse(irregular.value) : ''
    //   );

    console.log({ filterForm: this.form });

    // this.valueFormEmitter.emit(this.form.value);

    const formValue: any = {};
    const { value } = this.form;
    if ( value.selectedUses ) {
      value.type = value.type.concat(value.selectedUses);
      delete value.selectedUses;
    }
    Object.keys(value).forEach(key => value[key].length > 0 ? formValue[key] = value[key] : false );
    if (Object.keys(formValue).length > 0) {
      localStorage.setItem(this.actualLabel, JSON.stringify(formValue))
    } else {
      localStorage.removeItem(this.actualLabel);
    }
    this.valueFormEmitter.emit(formValue);
  }
}
