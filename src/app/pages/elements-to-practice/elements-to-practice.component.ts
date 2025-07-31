import { Component, OnInit } from '@angular/core';
import { ContentHeaderComponent } from '../components/content-header/content-header.component';
import { TableComponent } from '../components/table/table.component';
// import { WordService } from './words.service';
import { ITableItem } from '../../interfaces/table-item.interface';
import { localStorageLabels, RoutesApp } from '../../constants';
import { Router, RouterModule } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  IContentHeaderInfoItem,
  IElementToPractice,
  IElementToPractice2,
  IPageTableInfo,
  IType,
} from '../../interfaces';
import { IFilterFormField } from '../../interfaces/filter-form-field.interface';
import { TypeService } from '../types/types.service';
import { ElementToPracticeService } from './element-to-practice.service';
import { TestService } from '../test/test.service';

@Component({
  selector: 'app-elements-to-practice',
  imports: [RouterModule, ContentHeaderComponent, TableComponent],
  templateUrl: './elements-to-practice.component.html',
  styleUrl: './elements-to-practice.component.css',
})
export class ElementsToPracticeComponent implements OnInit {
  public contentHeaderInfo: IContentHeaderInfoItem = {
    add: {
      label: 'Add Element To Practice',
      title: 'Add Element To Practice',
      route: `/${RoutesApp.elementsToPractice}/${RoutesApp.addElementToPractice}`,
    },
    title: 'Elements To Practice',
    test: {
      label: 'Element To Practice Test',
      title: 'Element To Practice Test',
      route: `/${RoutesApp.elementsToPractice}/${RoutesApp.test}`,
    },
  };

  public wordTypebId: string = 'TBKrgXIeg2LaUrMLhD0T';
  public verbId: string = 'cieWObetRIxQzKFddEg4';

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
    // {
    //   type: 'subForm',
    //   label: '',
    //   key: 'verbInfo',
    //   subForm: [
    //     {
    //       // type: 'switch',
    //       // label: 'Irregular',
    //       // key: 'irregular',
    //       // placeholder: 'Irregular',
    //       // switchInfo: {
    //       //   checked: 'Irregular',
    //       //   unChecked: 'Regular',
    //       // }
    //       type: 'select',
    //       label: 'Irregular',
    //       key: 'irregular',
    //       placeholder: 'Irregular',
    //       intialValue: '',
    //       selectOptions: [
    //         {
    //           id: false,
    //           name: 'Regular',
    //         },
    //         {
    //           id: true,
    //           name: 'Irregular',
    //         },
    //       ],
    //     },
    //     {
    //       type: 'select',
    //       label: 'Type',
    //       key: 'wordType',
    //       placeholder: 'Type',
    //       // intialValue: this.verbId
    //       intialValue: '',
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
    //   ],
    // },
  ];

  // public verbInfoKey: string = 'verbInfo';

  public tableInfo: Array<ITableItem> = [
    // {
    //   header: 'Type',
    //   key: `${this.verbInfoKey}.wordType.name`
    // },
    {
      header: 'Type',
      key: `type.name`,
    },
    // {
    //   header: 'Irregular',
    //   key: `${this.verbInfoKey}.irregular`,
    // },
    {
      header: 'Basic',
      key: 'en',
    },
    {
      header: 'Meanings',
      key: 'meanings',
    },
    // {
    //   header: 'Simple Present',
    //   key: `${this.verbInfoKey}.simplePresent`
    // },
    // {
    //   header: 'Simple Past',
    //   key: `${this.verbInfoKey}.simplePast`,
    // },
    // {
    //   header: 'Past Participle',
    //   key: `${this.verbInfoKey}.pastParticiple`,
    // },
    // {
    //   header: 'Meaning',
    //   key: 'es'
    // },
  ];

  public page: IPageTableInfo | any = {
    index: 1,
    size: 10,
  };
  // public itemList: Array<IWord> = [];
  public itemList: Array<any> = [];
  public elementsToPractice: Array<IElementToPractice2> = [];

  public types: Array<IType> = [];

  constructor(
    private _router: Router,
    private _typeSvc: TypeService,
    private _elementToPracticeSvc: ElementToPracticeService,
    private _notificationSvc: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.getElementsToPractice();
  }

  public getElementsToPractice(query?: any, options?: any): void {
    if (!query) localStorage.removeItem(localStorageLabels.filerBodyETP);
    this._elementToPracticeSvc
      .getFilteredElementsToPractice(query)
      .subscribe((elementsToPractice) => {
        // console.log({ elementsToPractice });
        this.elementsToPractice = elementsToPractice;
        if (this.types.length === 0) {this.getTypes()} else {
          this.getElementsToPracticeTypes(this.types);
          // localStorage.removeItem(localStorageLabels.selectedListOfETP);
        }
        // this.itemList = elementsToPractice;
      });
  }

  public getTypes(): void {
    this._typeSvc.getTypes().subscribe(
      (types) => {
        this.types = types;
        this.getElementsToPracticeTypes(types);
        types.forEach(typeItem => {
          const { name, id, father } = typeItem;
          return this.filterFormFields[!father ? 1 : 2].selectOptions?.push({ name, id });
        })
        // console.log({ types, filterFormFields: this.filterFormFields }) ;
      },
      (error) => {
        console.log({ error });
      }
    );
  }

  public getElementsToPracticeTypes(types: IType[]): IElementToPractice2[] {
    return this.elementsToPractice = this.elementsToPractice.map((elementItem) => {
      const typeId = elementItem.type;
      elementItem.type = types.find((type) => type.id === typeId) ?? typeId;
      return elementItem;
    });
  }; 

  public elementToPracticeEdit(id: string): void {
    this._router.navigate([
      `/${RoutesApp.elementsToPractice}/${RoutesApp.addElementToPractice}/${id}`,
    ]);
  }

  public elementToPracticeDelete(id: string, all?: boolean): void {
    this._elementToPracticeSvc
    .deleteElementToPractice(id)
    .then(
      (deleteResponse) => {
        // console.log({deleteResponse});
        if (!all) {
          const selectedList: IElementToPractice2[] = JSON.parse(localStorage.getItem(localStorageLabels.selectedListOfETP) ?? '[]');
          const selectedIndex: number = selectedList.findIndex(item => item.id === id);
          if (selectedIndex >= 0) {
            selectedList.splice(selectedIndex, 1);
            localStorage.setItem(localStorageLabels.selectedListOfETP, JSON.stringify(selectedList));
          }
          this._notificationSvc.success('Success', 'Element to practice deleted successfully.');
        }
      }
    )
    .catch(
      (error) => {
        console.log({error});
        this._notificationSvc.error('Error', 'There was an error and we were not able to delete the element to practice.');
      }
    )
  }

  
  public deleteAll(event: any): void {
    // console.log({ deleteAllEvent: event });
    JSON.parse(localStorage.getItem(localStorageLabels.selectedListOfETP) ?? '[]').forEach((item: any) => this.elementToPracticeDelete(item.id, true));
    localStorage.removeItem(localStorageLabels.selectedListOfETP);
    this._notificationSvc.success('Success', 'All the selected elements to practice were deleted successfully.');
  }
}
