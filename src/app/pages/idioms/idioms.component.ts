import { Component } from '@angular/core';
import { ContentHeaderComponent } from '../components/content-header/content-header.component';
import { TableComponent } from '../components/table/table.component';
import { IContentHeaderInfoItem, IFilterFormField, ITableItem } from '../../interfaces';
import { RoutesApp } from '../../constants';
import { Router } from '@angular/router';
import { ElementToPracticeService } from '../components/add-element-to-prectice/element-to-practice.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-idioms',
  imports: [ContentHeaderComponent, TableComponent],
  templateUrl: './idioms.component.html',
  styleUrl: './idioms.component.css'
})
export class IdiomsComponent {

  public contentHeaderInfo: IContentHeaderInfoItem = {
    add: {
      label: 'Add Idiom',
      title: 'Add Idiom',
      route: `/${RoutesApp.idioms}/${RoutesApp.addIdiom}`,
    },
    title: 'Idioms',
    test: {
      label: 'Idiom Test',
      title: 'Idiom Test',
      // route: `/${RoutesApp.idioms}/${RoutesApp.testidioms}`,
      route: `/${RoutesApp.idioms}/${RoutesApp.test}`,
    },
  }

  public idiomTypeId: string = 'bgndH2gcsCGti1k0i1zb';
  // public verbId: string = 'cieWObetRIxQzKFddEg4';

  public filterFormFields: Array<IFilterFormField> = [
    {
      type: 'text',
      label: 'Basic',
      key: 'en',
      placeholder: 'Basic',
    },
    {
      type: 'subForm',
      label: '',
      key: 'verbInfo',
      // subForm: [
      //   {
      //     type: 'switch',
      //     label: 'Irregular',
      //     key: 'irregular',
      //     placeholder: 'Irregular',
      //     switchInfo: {
      //       checked: 'Irregular',
      //       unChecked: 'Regular',
      //     }
      //   },
      //   {
      //     type: 'select',
      //     label: 'Type',
      //     key: 'idiomType',
      //     placeholder: 'Type',
      //     intialValue: this.verbId
      //   },
      //   {
      //     type: 'text',
      //     label: 'Simple Present',
      //     key: 'simplePresent',
      //     placeholder: 'Simple Present',
      //   },
      //   {
      //     type: 'text',
      //     label: 'Simple Past',
      //     key: 'simplePast',
      //     placeholder: 'Simple Past',
      //   },
      //   {
      //     type: 'text',
      //     label: 'PastParticiple',
      //     key: 'pastParticiple',
      //     placeholder: 'Past Participle',
      //   },
      // ]
    }
  ];
  
  // public verbInfoKey: string = 'verbInfo';

  public tableInfo: Array<ITableItem> = [
    {
      header: 'Basic',
      key: 'en'
    },
    {
      header: 'Meaning',
      key: 'es'
    },
  ]
  // public itemList: Array<Iidiom> = [];
  public itemList: Array<any> = [];

  constructor (
    private _router: Router, 
    // private _idiomSvc: idiomsService, 
    // private _typeServiceSvc: TypeService, 
    private _elementToPracticeSvc: ElementToPracticeService, 
    private _notificationSvc: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.getIdioms();
    // this.getidiomTypes();
  }
  
  public getIdioms(query?: any ): void {
    this._elementToPracticeSvc.getElementsToPracticeByType(this.idiomTypeId).subscribe(
      (idioms) => {
        this.itemList = idioms;
        // console.log({idioms});
      }, (error) => {
        console.log({error});
      }
    )
    console.log({ query });
    // this._elementToPracticeSvc.getFilteredElementsToPractice( query ?? null ).subscribe(
    //   (idioms) => {
    //     this.itemList = idioms;
    //     console.log({idioms});
    //   }, (error) => {
    //     console.log({error});
    //   }
    // )
  };
  
  // public getidiomTypes(): void {
  //   this._typeServiceSvc.getTypesByFather(this.idiomTypebId).subscribe(
  //     (types) => {
  //       this.filterFormFields = this.filterFormFields.map((item) => {
  //         item.subForm?.map(
  //           (subFormItem) => {
  //             if (subFormItem.key === 'idiomType') {
  //               subFormItem.selectOptions = types;
  //             }
  //             return subFormItem;
  //           }
  //         )
  //         return item;
  //       }) 
  //       console.log({types});
  //     }, (error) => {
  //       console.log({error});
  //     }
  //   )
  // };

  public idiomEdit(id: string): void {
    this._router.navigate([`/${RoutesApp.idioms}/${RoutesApp.addIdiom}/${id}`])
  }

  public idiomDelete(id: string): void {
    // this._idiomSvc.deleteidiom(id)
    // .then(
    //   (deleteResponse) => {
    //     console.log({deleteResponse});
    //     this._notificationSvc.success('Success', 'idiom deleted successfully.');
    //   }
    // )
    // .catch(
    //   (error) => {
    //     console.log({error});
    //     this._notificationSvc.error('Error', 'There was an error and we were not able to delete the idiom.');
    //   }
    // )
  }
}

