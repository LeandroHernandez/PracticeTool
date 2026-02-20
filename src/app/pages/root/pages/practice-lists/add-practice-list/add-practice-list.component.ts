import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { TableComponent } from '../../components/table/table.component';
// import { IFilterFormField, ITableItem } from '../../../interfaces';
import { ElementToPracticeService } from '../../elements-to-practice/element-to-practice.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';
import { PracticeListsService } from '../practice-lists.service';
import { filterFieldTypes, IElementToPractice, IFilterFormField, IPageTableInfo, IPracticeList, ITableItem, IType } from '../../../../../interfaces';
import { localStorageLabels } from '../../../../../enums';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { TypeService } from '../../types/types.service';
import { TableService } from '../../components/table/table.service';

@Component({
  selector: 'app-add-practice-list',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    TableComponent,
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

  public filterFormFields: Array<IFilterFormField> = [
    {
      type: 'text',
      label: 'Basic',
      key: 'en',
      placeholder: 'Basic form',
    },
    {
      type: 'multiselect',
      label: 'Type',
      key: 'type',
      placeholder: 'Type',
      selectOptions: [],
      intialValue: [],
    },
    {
      type: 'multiselect',
      label: 'Uses',
      key: 'selectedUses',
      placeholder: 'Uses',
      selectOptions: [],
      intialValue: [],
    },
  ];

  public tableInfo: Array<ITableItem> = [
    {
      header: 'Type',
      key: `type.name`,
      filter: filterFieldTypes.multiselect,
    },
    {
      header: 'Basic',
      key: 'en',
      filter: filterFieldTypes.text,
    },
    {
      header: 'Meanings',
      key: 'meanings',
    },
  ];

  public page: IPageTableInfo | any = {
    index: 1,
    size: 10,
  };

  public types: Array<IType> = [];

  get language(): string {
    const res: string = localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en';
    return res;
  }

  // get list(): string[] {
  //   return this.form.get('list')?.value;
  // }

  constructor(
    private _fb: FormBuilder,
    private _route: ActivatedRoute,
    private _typeSvc: TypeService,
    private _tableSvc: TableService,
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

    this.form.get('list')?.valueChanges.subscribe(val => {
      console.log({ val });
      this._tableSvc.setlist(val);
    })

    this.id = this._route.snapshot.paramMap.get('id');
    if (this.id) this.getPracticeList(this.id);
  }

  public elementsToPractice: Array<any> = [];

  ngOnInit(): void {
    this.getElementsToPractice();
    // this._tableSvc.list$.subscribe(tableSelectedList => {
    //   console.log({ tableSelectedList })
    // })
  }

  public getItemName(id: string): string {
    return this.elementsToPractice.find(item => item.id === id)?.en;
  }

  public getElementsToPractice(query?: any, options?: any): void {
    if (!query) localStorage.removeItem(localStorageLabels.etp.filerBody);
    this._elementToPracticeSvc.getFilteredElementsToPractice(query).subscribe(
      (elementsToPractice) => {
        this.elementsToPractice = elementsToPractice;
        if (this.types.length === 0) {
          this.getTypes();
        } else {
          this.getElementsToPracticeTypes(this.types);
        }
      },
      (error) => {
        console.error({ error });
        this.elementsToPractice = [];
      }
    );
  }

  public getTypes(): void {
    this._typeSvc.getTypes().subscribe(
      (types) => {
        this.types = types;
        this.getElementsToPracticeTypes(types);
        types.forEach((typeItem) => {
          const { name, id, father } = typeItem;
          const index = !father ? 1 : 2;
          if (
            this.filterFormFields[index].selectOptions?.includes(
              (item: { name: string, id: string }) => item.id === id)
          ) return;
          return this.filterFormFields[!father ? 1 : 2].selectOptions?.push({
            name,
            id,
          });
        });
      },
      (error) => {
        console.log({ error });
      }
    );
  }

  public getElementsToPracticeTypes(types: IType[]): IElementToPractice[] {
    if (!this.elementsToPractice) return [];
    return (this.elementsToPractice = this.elementsToPractice.map(
      (elementItem) => {
        const typeId = elementItem.type;
        elementItem.type = types.find((type) => type.id === typeId) ?? typeId;
        return elementItem;
      }
    ));
  }

  public getPracticeList(id: string): void {
    this._practiceListsSvc.getPracticeList(id).subscribe(
      (practiceList) => {
        // console.log({ practiceList });
        // const { title, list } = practiceList;
        const { list } = practiceList;
        this.form.patchValue({ title: practiceList.title, list })
      }
    )
  }

  public getControlErrors(control: string, subControl?: string): Array<string> {
    const ctrl = this.form.controls[control];
    if (!ctrl) return [];
    return Object.keys(subControl ? ctrl.get(subControl)?.errors ?? {} : ctrl.errors ?? {});
  }

  public selectionChange(list: Set<number>) {
    console.log({ list });
    this.form.get('list')?.patchValue(this.elementsToPractice.filter((item) =>
      list.has(item.id)
    ).map(item => item.id));
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
