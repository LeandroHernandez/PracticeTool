import { Component, OnInit } from '@angular/core';
import { TableComponent } from '../components/table/table.component';
import { ContentHeaderComponent } from '../components/content-header/content-header.component';
import { IContentHeaderInfoItem, ITableItem } from '../../interfaces';
import { RoutesApp } from '../../constants';
import { IFilterFormField } from '../../interfaces/filter-form-field.interface';
import { PracticeListsService } from './practice-lists.service';

@Component({
  selector: 'app-practice-lists',
  imports: [ ContentHeaderComponent, TableComponent ],
  templateUrl: './practice-lists.component.html',
  styleUrl: './practice-lists.component.css'
})
export class PracticeListsComponent implements OnInit {

  public contentHeaderInfo: IContentHeaderInfoItem = {
    add: {
      label: 'Add Practice List',
      title: 'Add Practice List',
      route: `/${RoutesApp.practiceLists}/${RoutesApp.addPracticeList}`,
    },
    title: 'Practice Lists',
    test: {
      label: 'Practice List Test',
      title: 'Practice List Test',
      route: `/${RoutesApp.practiceLists}/${RoutesApp.test}`,
      disabled: true,
    },
  }

  // public wordTypebId: string = 'TBKrgXIeg2LaUrMLhD0T';
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
      //     key: 'wordType',
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

  public verbInfoKey: string = 'verbInfo';

  public tableInfo: Array<ITableItem> = [
    {
      header: 'Created By',
      key: `createdBy`
    },
    {
      header: 'Title',
      key: 'title'
    },
    {
      header: 'items',
      key: 'list'
    },
  ]
  // public itemList: Array<IWord> = [];
  public itemList: Array<any> = [];

  constructor (private _practiceListsSvc: PracticeListsService) {}
  
  ngOnInit(): void {
    this.getPracticeLists();
  }

  public getPracticeLists(query?: any ): void {
    console.log({ query });
    this._practiceListsSvc.getPracticeLists().subscribe(
      (practiceLists) => {
        this.itemList = practiceLists;
        console.log({practiceLists});
      }, (error) => {
        console.log({error});
      }
    )
  };

  // public getWordTypes(): void {
  //   this._typeServiceSvc.getTypesByFather(this.wordTypebId).subscribe(
  //     (types) => {
  //       this.filterFormFields = this.filterFormFields.map((item) => {
  //         item.subForm?.map(
  //           (subFormItem) => {
  //             if (subFormItem.key === 'wordType') {
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

  public practiceListEdit(id: string): void {
    // this._router.navigate([`/${RoutesApp.practiceLists}/${RoutesApp.addpracticeList}/${id}`])
  }

  public practiceListDelete(id: string): void {
    // this._practiceListSvc.deletepracticeList(id)
    // .then(
    //   (deleteResponse) => {
    //     console.log({deleteResponse});
    //     this._notificationSvc.success('Success', 'practiceList deleted successfully.');
    //   }
    // )
    // .catch(
    //   (error) => {
    //     console.log({error});
    //     this._notificationSvc.error('Error', 'There was an error and we were not able to delete the practiceList.');
    //   }
    // )
  }

}
