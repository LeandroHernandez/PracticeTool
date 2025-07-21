import { Component, OnInit } from '@angular/core';
import { ContentHeaderComponent } from '../components/content-header/content-header.component';
import { TableComponent } from '../components/table/table.component';
// import { WordService } from './words.service';
import { ITableItem } from '../../interfaces/table-item.interface';
import { RoutesApp } from '../../constants';
import { Router, RouterModule } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  IContentHeaderInfoItem,
  IElementToPractice,
  IElementToPractice2,
  IPageTableInfo,
  IType,
} from '../../interfaces';
import { ElementToPracticeService } from '../components/add-element-to-prectice/element-to-practice.service';
import { IFilterFormField } from '../../interfaces/filter-form-field.interface';
import { TypeService } from '../types/types.service';

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
      placeholder: 'Basic',
    },
    {
      type: 'subForm',
      label: '',
      key: 'verbInfo',
      subForm: [
        {
          // type: 'switch',
          // label: 'Irregular',
          // key: 'irregular',
          // placeholder: 'Irregular',
          // switchInfo: {
          //   checked: 'Irregular',
          //   unChecked: 'Regular',
          // }
          type: 'select',
          label: 'Irregular',
          key: 'irregular',
          placeholder: 'Irregular',
          intialValue: '',
          selectOptions: [
            {
              id: false,
              name: 'Regular',
            },
            {
              id: true,
              name: 'Irregular',
            },
          ],
        },
        {
          type: 'select',
          label: 'Type',
          key: 'wordType',
          placeholder: 'Type',
          // intialValue: this.verbId
          intialValue: '',
        },
        {
          type: 'text',
          label: 'Simple Present',
          key: 'simplePresent',
          placeholder: 'Simple Present',
        },
        {
          type: 'text',
          label: 'Simple Past',
          key: 'simplePast',
          placeholder: 'Simple Past',
        },
        {
          type: 'text',
          label: 'PastParticiple',
          key: 'pastParticiple',
          placeholder: 'Past Participle',
        },
      ],
    },
  ];

  public verbInfoKey: string = 'verbInfo';

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
    // private _wordSvc: WordService,
    private _typeServiceSvc: TypeService,
    private _elementToPracticeSvc: ElementToPracticeService,
    private _notificationSvc: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.getElementsToPractice();
    // this.getWordTypes();
    // this.getTypes();
  }

  public getElementsToPractice(query?: any, options?: any): void {
    // // this._elementToPracticeSvc.getElementsToPracticeByType(this.wordTypebId).subscribe(
    // //   (words) => {
    // //     this.itemList = words;
    // //     console.log({words});
    // //   }, (error) => {
    // //     console.log({error});
    // //   }
    // // )
    // console.log({ query });
    // // this._elementToPracticeSvc.getFilteredElementsToPractice( query ?? null ).subscribe(
    // this._elementToPracticeSvc.getFilteredElementsToPractice( { type: this.wordTypebId, ...query }, options ?? null ).subscribe(
    //   (words) => {
    //     this.itemList = words;
    //     // console.log({words});
    //   }, (error) => {
    //     console.log({error});
    //   }
    // )

    // this._elementToPracticeSvc
    //   .getElementsToPractice2()
    //   .subscribe((elementsToPractice) => {
    //     console.log({ elementsToPractice });
    //     this.elementsToPractice = elementsToPractice;
    //     this.getTypes();
    //     // this.itemList = elementsToPractice;
    //   });
    this._elementToPracticeSvc
      .getFilteredElementsToPractice(query)
      .subscribe((elementsToPractice) => {
        console.log({ elementsToPractice });
        this.elementsToPractice = elementsToPractice;
        this.getTypes();
        // this.itemList = elementsToPractice;
      });
  }

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

  public getTypes(): void {
    this._typeServiceSvc.getTypes().subscribe(
      (types) => {
        this.types = types;
        this.elementsToPractice = this.elementsToPractice.map((elementItem) => {
          const typeId = elementItem.type;
          elementItem.type = types.find((type) => type.id === typeId) ?? typeId;
          return elementItem;
        });
        // console.log({ elementsToPractice: this.elementsToPractice });
        this.filterFormFields = this.filterFormFields.map((item) => {
          item.subForm?.map((subFormItem) => {
            if (subFormItem.key === 'wordType') {
              subFormItem.selectOptions = types;
            }
            return subFormItem;
          });
          return item;
        });
        console.log({ types });
      },
      (error) => {
        console.log({ error });
      }
    );
  }

  public elementToPracticeEdit(id: string): void {
    this._router.navigate([
      `/${RoutesApp.elementsToPractice}/${RoutesApp.addElementToPractice}/${id}`,
    ]);
  }

  public elementToPracticeDelete(id: string): void {
    // this._wordSvc.deleteWord(id)
    // .then(
    //   (deleteResponse) => {
    //     console.log({deleteResponse});
    //     this._notificationSvc.success('Success', 'Word deleted successfully.');
    //   }
    // )
    // .catch(
    //   (error) => {
    //     console.log({error});
    //     this._notificationSvc.error('Error', 'There was an error and we were not able to delete the word.');
    //   }
    // )

    this._elementToPracticeSvc
      .deleteElementToPractice(id)
      .then((deleteResponse) => console.log({ deleteResponse }))
      .catch((error) => console.log({ error }));
  }

  // public filterAction(item: IElementToPractice | null): void {
  //   console.log({ item });
  // }
}
