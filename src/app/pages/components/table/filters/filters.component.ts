import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IFilterFormField } from '../../../../interfaces/filter-form-field.interface';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

@Component({
  selector: 'app-filters',
  imports: [ReactiveFormsModule, NzSwitchModule],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css'
})
export class FiltersComponent implements OnInit {
  
  @Output() valueFormEmitter: EventEmitter<any> = new EventEmitter();
  @Input() filterFormFields: Array<IFilterFormField> = []

  
  // public activeForm: FormGroup;
  public form: FormGroup;

  // public get activeFilters(): boolean {
  //   return this.activeForm.controls['activeFilters'].value;
  // };
  
  constructor(private _fb: FormBuilder) {
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

    const group: FormGroup = this._fb.group({})

    items.forEach(
      (item) => {
        // return group.addControl(item.key, item.type !=='subForm' ? [ this.getfieldType(item) ] : this.buildForm(item.subForm ?? []));
        group.addControl(
          item.key,
          item.type !== 'subForm'
            ? this._fb.control( item.intialValue ?? this.getfieldType(item))
            : this.buildForm(item.subForm ?? [])
        );
        
      }
    )


    return group;

  }

  public initForm(): void {
    this.form = this.buildForm(this.filterFormFields);
    console.log({ form: this.form });
    // this.form.disable();
  };

  // public changeActiveFilters(): void {

  //   console.log({activeFilters: this.activeFilters})

  //   if (!this.activeFilters) {
  //     return this.form.disable()
  //   }

  //   return this.form.enable();
  // }

  public submit(): void {
    const irregular = this.form.get('verbInfo')?.get('irregular');
    this.form.get('verbInfo')?.get('irregular')?.patchValue( irregular && irregular.value !== '' ? JSON.parse(irregular.value) : '');

    this.valueFormEmitter.emit(this.form.value);
  }

}
