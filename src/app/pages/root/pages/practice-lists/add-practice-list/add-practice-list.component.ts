import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { TableComponent } from '../../components/table/table.component';
// import { IFilterFormField, ITableItem } from '../../../interfaces';
import { ElementToPracticeService } from '../../elements-to-practice/element-to-practice.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';
import { PracticeListsService } from '../practice-lists.service';
import { IPracticeList } from '../../../../../interfaces';
import { localStorageLabels } from '../../../../../enums';
import { NzPopoverModule } from 'ng-zorro-antd/popover';

@Component({
  selector: 'app-add-practice-list',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NzSwitchModule,
    NzSelectModule,
    NzPopoverModule
  ],
  templateUrl: './add-practice-list.component.html',
  styleUrl: './add-practice-list.component.css'
})
export class AddPracticeListComponent implements OnInit {

  public form: FormGroup;

  public id: string | null = null;

  public showErrors: boolean = false;

  get language(): string {
    const res: string = localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en';
    return res;
  }

  constructor(
    private _fb: FormBuilder,
    private _route: ActivatedRoute,
    private _elementToPracticeSvc: ElementToPracticeService,
    private _practiceListsSvc: PracticeListsService,
    private _nzNotificationSvc: NzNotificationService
  ) {
    this.form = this._fb.group({
      // createdBy: [''],
      // title: ['', [Validators.required]],
      title: this._fb.group({
        en: ['', [Validators.required]],
        es: ['', [Validators.required]],
      }),
      list: [[], [Validators.required]],
      state: [{ value: true, disabled: true }, [Validators.required]],
    })

    this.id = this._route.snapshot.paramMap.get('id');
    if (this.id) this.getPracticeList(this.id);
  }

  public elementsToPractice: Array<any> = [];

  ngOnInit(): void {
    this.getElementsToPracice();
  }

  public getElementsToPracice(query?: any): void {
    this._elementToPracticeSvc.getElementsToPractice().subscribe(
      (elementsToPractice) => {
        this.elementsToPractice = elementsToPractice;
        // console.log({ elementsToPractice });
      }, (error) => {
        console.log({ error });
      }
    )
    // console.log({ query });
  };

  public getPracticeList(id: string): void {
    this._practiceListsSvc.getPracticeList(id).subscribe(
      (practiceList) => {
        // console.log({ practiceList });
        const { title, list } = practiceList;
        this.form.patchValue({ title, list })
      }
    )
  }

  public getControlErrors(control: string, subControl?: string): Array<string> {
    const ctrl = this.form.controls[control];
    if (!ctrl) return [];
    return Object.keys(subControl ? ctrl.get(subControl)?.errors ?? {} : ctrl.errors ?? {});
  }

  public letters(w: string): string[] {
    return w.split('');
  }

  public isRequired(control: string): boolean {
    return this.form.controls[control].hasValidator(Validators.required);
  }

  public invalidForm(): NzNotificationRef {
    this.showErrors = true;
    return this._nzNotificationSvc.warning('Invalid Form', 'The form is not valid, please check out the values.');
  };

  public successful(edit?: boolean): NzNotificationRef {
    return this._nzNotificationSvc.success(`Successful ${edit ? 'Edition' : 'Registration'}`, `The practice list was ${edit ? 'edited' : 'registered'} successfully.`);
  };

  public error(edit?: boolean): NzNotificationRef {
    return this._nzNotificationSvc.success('Error', 'Something went wrong so we were not able to complete the proccess, please try again.');
  };

  public submit(): void | NzNotificationRef | Promise<void> {

    if (!this.form.valid) return this.invalidForm();

    // console.log({ form: this.form });

    const formValue = { ...this.form.value };

    if (this.id) return this._practiceListsSvc.updatePracticeList(this.id, formValue)
      .then(
        response => {
          // console.log({ response });
          const selectedList: Array<IPracticeList> = JSON.parse(localStorage.getItem(localStorageLabels.pl.selectedList) ?? '[]');

          if (selectedList.length > 0) {
            const selectedItemIndex: number = selectedList.findIndex(item => item.id === this.id);
            if (selectedItemIndex >= 0) {
              const updatedItem = selectedList[selectedItemIndex];
              const list: any[] = [];
              formValue.list.forEach((id: string) => {
                list.push(this.elementsToPractice.find(etpItem => etpItem.id === id) ?? id);
              });
              selectedList[selectedItemIndex] = { ...updatedItem, ...formValue, list };
              localStorage.setItem(localStorageLabels.pl.selectedList, JSON.stringify(selectedList));
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
      );

    return this._practiceListsSvc.addPracticeList(formValue)
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
      .finally(() => this.form.reset());
  }

}
