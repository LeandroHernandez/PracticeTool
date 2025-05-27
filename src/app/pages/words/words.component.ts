import { Component, OnInit } from '@angular/core';
import { ContentHeaderComponent } from '../components/content-header/content-header.component';
import { TableComponent } from '../components/table/table.component';
import { WordService } from './words.service';
import { ITableItem } from '../../interfaces/table-item.interface';
import { RoutesApp } from '../../constants';
import { Router, RouterModule } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { IContentHeaderInfoItem, IElementToPractice, IPageTableInfo } from '../../interfaces';
import { ElementToPracticeService } from '../components/add-element-to-prectice/element-to-practice.service';
import { IFilterFormField } from '../../interfaces/filter-form-field.interface';
import { TypeService } from '../types/types.service';

@Component({
  selector: 'app-words',
  imports: [RouterModule, ContentHeaderComponent, TableComponent],
  templateUrl: './words.component.html',
  styleUrl: './words.component.css'
})
export class WordsComponent implements OnInit{

  public contentHeaderInfo: IContentHeaderInfoItem = {
    add: {
      label: 'Add Word',
      title: 'Add Word',
      route: `/${RoutesApp.words}/${RoutesApp.addWord}`,
    },
    title: 'Words',
    test: {
      label: 'Word Test',
      title: 'Word Test',
      // route: `/${RoutesApp.words}/${RoutesApp.testWords}`,
      route: `/${RoutesApp.words}/${RoutesApp.test}`,
    },
  }

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
      type: 'select',
      label: 'Type',
      key: 'wordType',
      placeholder: 'Type',
      // intialValue: this.verbId
      intialValue: ''
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
              name: 'Regular'
            },
            {
              id: true,
              name: 'Irregular'
            },
          ]
        },
        // {
        //   type: 'select',
        //   label: 'Type',
        //   key: 'wordType',
        //   placeholder: 'Type',
        //   // intialValue: this.verbId
        //   intialValue: ''
        // },
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
      ]
    }
  ];
  
  public verbInfoKey: string = 'verbInfo';

  public tableInfo: Array<ITableItem> = [
    {
      header: 'Type',
      // key: `${this.verbInfoKey}.wordType.name`
      key: `wordType.name`
    },
    {
      header: 'Irregular',
      key: `${this.verbInfoKey}.irregular`,
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

  public page: IPageTableInfo = {
    pageSize: 10,
    startAfterDoc: undefined,
  }
  // public itemList: Array<IWord> = [];
  public itemList: Array<any> | null = null;

  constructor (
    private _router: Router, 
    private _wordSvc: WordService, 
    private _typeServiceSvc: TypeService, 
    private _elementToPracticeSvc: ElementToPracticeService, 
    private _notificationSvc: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.getWords();
    this.getWordTypes();
  }

  public normalize(): void {
    if (this.itemList) {
      this.itemList.forEach(
        (word) => {
          // // console.log({ prevWord: word });
          // const esList: Array<string> = [];
          // word.es.forEach(
          //   (meaning: any) => {
          //     if (typeof meaning === 'string') {
          //       return;
          //     }
          //     esList.push(meaning.value);
          //     // meaning = meaning.value;
          //   }
          // );
          // word.es = esList;
          // if (esList.length === 0) {
          //   return;
          // }
          const body = {
            irregular: false,
            pastParticiple: "",
            simplePast: "",
            simplePresent: "",
            wordType: "cieWObetRIxQzKFddEg4",
          };
          if (!word.verbInfo.irregular) {
            word.verbInfo = body;
            this._elementToPracticeSvc.updateElementToPractice(word.id, {...word})
            .then((response) => console.log({response}))
            .catch((error) => console.log({error}))
          }
          // console.log({ postWord: word });
        }
      )
    }
  }
  
  public getWords(query?: any, options?: any ): void {
    // this._elementToPracticeSvc.getElementsToPracticeByType(this.wordTypebId).subscribe(
    //   (words) => {
    //     this.itemList = words;
    //     console.log({words});
    //   }, (error) => {
    //     console.log({error});
    //   }
    // )
    console.log({ query });
    // this._elementToPracticeSvc.getFilteredElementsToPractice( query ?? null ).subscribe(
    this._elementToPracticeSvc.getFilteredElementsToPractice( { type: this.wordTypebId, ...query }, options ?? undefined ).subscribe(
      (words) => {
        this.itemList = words;
        console.log({words});
        // this.normalize();
      }, (error) => {
        console.log({error});
      }
    )
  };
  
  
  public getWordTypes(): void {
    this._typeServiceSvc.getTypesByFather(this.wordTypebId).subscribe(
      (types) => {
        this.filterFormFields = this.filterFormFields.map((item) => {
          // item.subForm?.map(
          //   (subFormItem) => {
          //     if (subFormItem.key === 'wordType') {
          //       subFormItem.selectOptions = types;
          //     }
          //     return subFormItem;
          //   }
          // )
          item.selectOptions = types;
          return item;
        }) 
        console.log({types});
      }, (error) => {
        console.log({error});
      }
    )
  };

  public wordEdit(id: string): void {
    this._router.navigate([`/${RoutesApp.words}/${RoutesApp.addWord}/${id}`])
  }

  public wordDelete(id: string): void {
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
    this._elementToPracticeSvc.deleteElementToPractice(id)
    .then(
      (deleteResponse) => {
        console.log({deleteResponse});
        this._notificationSvc.success('Success', 'Word deleted successfully.');
      }
    )
    .catch(
      (error) => {
        console.log({error});
        this._notificationSvc.error('Error', 'There was an error and we were not able to delete the word.');
      }
    )
  }

  // public filterAction(item: IElementToPractice | null): void {
  //   console.log({ item });
  // }
}
