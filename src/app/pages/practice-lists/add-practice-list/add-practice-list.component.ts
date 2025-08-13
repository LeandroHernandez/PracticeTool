import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { TableComponent } from '../../components/table/table.component';
// import { IFilterFormField, ITableItem } from '../../../interfaces';
import { ElementToPracticeService } from '../../elements-to-practice/element-to-practice.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';
import { PracticeListsService } from '../practice-lists.service';
import { IPracticeList } from '../../../interfaces';
import { localStorageLabels } from '../../../constants';

@Component({
  selector: 'app-add-practice-list',
  // imports: [RouterLink, ReactiveFormsModule, TableComponent, NzSwitchModule],
  imports: [RouterLink, ReactiveFormsModule, NzSwitchModule, NzSelectModule],
  templateUrl: './add-practice-list.component.html',
  styleUrl: './add-practice-list.component.css'
})
export class AddPracticeListComponent implements OnInit {

  public form: FormGroup;

  public id: string | null = null;

  constructor(
    private _fb: FormBuilder,
    private _route: ActivatedRoute,
    private _elementToPracticeSvc: ElementToPracticeService,
    private _practiceListsSvc: PracticeListsService,
    private _nzNotificationSvc: NzNotificationService
  ) {
    this.form = this._fb.group({
      // createdBy: [''],
      title: ['', [ Validators.required ]],
      list: [[], [ Validators.required ]],
      state: [{value: true, disabled: true}, [ Validators.required ]],
    })

    this.id = this._route.snapshot.paramMap.get('id');
    if(this.id) this.getPracticeList(this.id);
  }

  // public verbId: string = 'cieWObetRIxQzKFddEg4';

  // public filterFormFields: Array<IFilterFormField> = [
  //   {
  //     type: 'select',
  //     label: 'Type',
  //     key: 'type',
  //     placeholder: 'Type',
  //   },
  //   {
  //     type: 'text',
  //     label: 'Basic',
  //     key: 'en',
  //     placeholder: 'Basic',
  //   },
  //   {
  //     type: 'subForm',
  //     label: '',
  //     key: 'verbInfo',
  //     subForm: [
  //       {
  //         type: 'switch',
  //         label: 'Irregular',
  //         key: 'irregular',
  //         placeholder: 'Irregular',
  //         switchInfo: {
  //           checked: 'Irregular',
  //           unChecked: 'Regular',
  //         }
  //       },
  //       {
  //         type: 'select',
  //         label: 'Word Type',
  //         key: 'wordType',
  //         placeholder: 'Word Type',
  //         intialValue: this.verbId
  //       },
  //       {
  //         type: 'text',
  //         label: 'Simple Present',
  //         key: 'simplePresent',
  //         placeholder: 'Simple Present',
  //       },
  //       {
  //         type: 'text',
  //         label: 'Simple Past',
  //         key: 'simplePast',
  //         placeholder: 'Simple Past',
  //       },
  //       {
  //         type: 'text',
  //         label: 'PastParticiple',
  //         key: 'pastParticiple',
  //         placeholder: 'Past Participle',
  //       },
  //     ]
  //   }
  // ];
  
  // public verbInfoKey: string = 'verbInfo';

  // public tableInfo: Array<ITableItem> = [
  //   {
  //     header: 'Type',
  //     key: `type`
  //   },
  //   {
  //     header: 'Word Type',
  //     key: `${this.verbInfoKey}.wordType.name`
  //   },
  //   {
  //     header: 'Irregular',
  //     key: `${this.verbInfoKey}.irregular`,
  //   },
  //   {
  //     header: 'Basic',
  //     key: 'en'
  //   },
  //   {
  //     header: 'Simple Present',
  //     key: `${this.verbInfoKey}.simplePresent`
  //   },
  //   {
  //     header: 'Simple Past',
  //     key: `${this.verbInfoKey}.simplePast`,
  //   },
  //   {
  //     header: 'Past Participle',
  //     key: `${this.verbInfoKey}.pastParticiple`,
  //   },
  //   {
  //     header: 'Meaning',
  //     key: 'es'
  //   },
  // ]
  // public itemList: Array<IWord> = [];
  public elementsToPractice: Array<any> = [];

  ngOnInit(): void {
    this.getElementsToPracice();
  }

  public getElementsToPracice(query?: any ): void {
    this._elementToPracticeSvc.getElementsToPractice().subscribe(
      (elementsToPractice) => {
        this.elementsToPractice = elementsToPractice;
        console.log({elementsToPractice});
      }, (error) => {
        console.log({error});
      }
    )
    console.log({ query });
  };

  public getPracticeList(id: string): void {
    this._practiceListsSvc.getPracticeList(id).subscribe(
      (practiceList) => {
        console.log({practiceList});
        const { title, list } = practiceList;
        this.form.patchValue({ title, list })
      }
    )
  }

  // public elementToPraciceEdit(id: string): void {
  //   // this._router.navigate([`/${RoutesApp.elementToPracices}/${RoutesApp.addelementToPracice}/${id}`])
  // }

  // public elementToPraciceDelete(id: string): void {
  //   // this._elementToPraciceSvc.deleteelementToPracice(id)
  //   // .then(
  //   //   (deleteResponse) => {
  //   //     console.log({deleteResponse});
  //   //     this._notificationSvc.success('Success', 'elementToPracice deleted successfully.');
  //   //   }
  //   // )
  //   // .catch(
  //   //   (error) => {
  //   //     console.log({error});
  //   //     this._notificationSvc.error('Error', 'There was an error and we were not able to delete the elementToPracice.');
  //   //   }
  //   // )
  // }

  public invalidForm(): NzNotificationRef {
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

    console.log({ form: this.form });

    const formValue = {...this.form.value};

    if (this.id) return this._practiceListsSvc.updatePracticeList(this.id, formValue)
      .then( 
        response => {
          console.log({ response });
        const selectedList: Array<IPracticeList> = JSON.parse(localStorage.getItem(localStorageLabels.selectedListOfPL) ?? '[]');
        
        if ( selectedList.length > 0 ) {
          const selectedItemIndex: number = selectedList.findIndex(item => item.id === this.id);
          if (selectedItemIndex >= 0) {
            const updatedItem = selectedList[selectedItemIndex];
            const list: any[] = [];
            formValue.list.forEach((id: string) => {
              list.push(this.elementsToPractice.find(etpItem => etpItem.id === id) ?? id);
            });
            selectedList[selectedItemIndex] = { ...updatedItem, ...formValue, list };
            localStorage.setItem(localStorageLabels.selectedListOfPL, JSON.stringify(selectedList));
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
        console.log({ response });
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
