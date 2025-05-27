import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { TableComponent } from '../../components/table/table.component';
import { IFilterFormField, ITableItem } from '../../../interfaces';
import { ElementToPracticeService } from '../../components/add-element-to-prectice/element-to-practice.service';

@Component({
  selector: 'app-add-practice-list',
  imports: [RouterLink, ReactiveFormsModule, TableComponent, NzSwitchModule],
  templateUrl: './add-practice-list.component.html',
  styleUrl: './add-practice-list.component.css'
})
export class AddPracticeListComponent implements OnInit {

  public form: FormGroup;

  constructor(private _fb: FormBuilder, private _elementToPracticeSvc: ElementToPracticeService) {
    this.form = this._fb.group({
      createdBy: [''],
      title: ['', [ Validators.required ]],
      list: [[], [ Validators.required ]],
      state: [{value: true, disabled: true}, [ Validators.required ]],
    })
  }

  public verbId: string = 'cieWObetRIxQzKFddEg4';

  public filterFormFields: Array<IFilterFormField> = [
    {
      type: 'select',
      label: 'Type',
      key: 'type',
      placeholder: 'Type',
    },
    {
      type: 'text',
      label: 'Basic',
      key: 'en',
      placeholder: 'Basic',
    },
    // {
    //   type: 'subForm',
    //   label: '',
    //   key: 'verbInfo',
    //   subForm: [
    //     {
    //       type: 'switch',
    //       label: 'Irregular',
    //       key: 'irregular',
    //       placeholder: 'Irregular',
    //       switchInfo: {
    //         checked: 'Irregular',
    //         unChecked: 'Regular',
    //       }
    //     },
    //     {
    //       type: 'select',
    //       label: 'Word Type',
    //       key: 'wordType',
    //       placeholder: 'Word Type',
    //       intialValue: this.verbId
    //     },
    //     {
    //       type: 'text',
    //       label: 'Simple Present',
    //       key: 'simplePresent',
    //       placeholder: 'Simple Present',
    //     },
    //     {
    //       type: 'text',
    //       label: 'Simple Past',
    //       key: 'simplePast',
    //       placeholder: 'Simple Past',
    //     },
    //     {
    //       type: 'text',
    //       label: 'PastParticiple',
    //       key: 'pastParticiple',
    //       placeholder: 'Past Participle',
    //     },
    //   ]
    // }
  ];
  
  public verbInfoKey: string = 'verbInfo';

  public tableInfo: Array<ITableItem> = [
    {
      header: 'Type',
      key: `type.name`
    },
    {
      header: 'Word Type',
      key: `wordType.name`
    },
    {
      header: 'Irregular',
      key: `irregular`,
    },
    {
      header: 'Basic',
      key: 'en'
    },
    {
      header: 'Simple Present',
      key: `${this.verbInfoKey}.simplePresent`
    },
    {
      header: 'Simple Past',
      key: `${this.verbInfoKey}.simplePast`,
    },
    {
      header: 'Past Participle',
      key: `${this.verbInfoKey}.pastParticiple`,
    },
    {
      header: 'Meaning',
      key: 'es'
    },
  ]
  // public itemList: Array<IWord> = [];
  public itemList: Array<any> = [];

  ngOnInit(): void {
    this.getElementsToPracice();
  }


  public getElementsToPracice( query?: any, options?: any ): void {
    this._elementToPracticeSvc.getFilteredElementsToPractice( query, options ?? undefined, true ).subscribe(
      (elementsToPractice) => {
        this.itemList = elementsToPractice;
        console.log({elementsToPractice});
      }, (error) => {
        console.log({error});
      }
    )
    console.log({ query });
  };

  public elementToPraciceEdit(id: string): void {
    // this._router.navigate([`/${RoutesApp.elementToPracices}/${RoutesApp.addelementToPracice}/${id}`])
  }

  public elementToPraciceDelete(id: string): void {
    // this._elementToPraciceSvc.deleteelementToPracice(id)
    // .then(
    //   (deleteResponse) => {
    //     console.log({deleteResponse});
    //     this._notificationSvc.success('Success', 'elementToPracice deleted successfully.');
    //   }
    // )
    // .catch(
    //   (error) => {
    //     console.log({error});
    //     this._notificationSvc.error('Error', 'There was an error and we were not able to delete the elementToPracice.');
    //   }
    // )
  }
  public submit(): void {}

}
