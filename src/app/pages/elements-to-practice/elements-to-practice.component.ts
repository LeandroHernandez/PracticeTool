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
import { PracticeListsService } from '../practice-lists/practice-lists.service';

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
  ];

  public verbInfoKey: string = 'verbInfo';

  public tableInfo: Array<ITableItem> = [
    {
      header: 'Type',
      key: `type.name`,
    },
    {
      header: 'Basic',
      key: 'en',
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
  
  public itemList: Array<any> = [];
  public elementsToPractice: Array<IElementToPractice2> = [];

  public types: Array<IType> = [];

  constructor(
    private _router: Router,
    private _typeSvc: TypeService,
    private _elementToPracticeSvc: ElementToPracticeService,
    private _practiceListsSvc: PracticeListsService,
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
        this.elementsToPractice = elementsToPractice;
        if (this.types.length === 0) {this.getTypes()} else {
          this.getElementsToPracticeTypes(this.types);
        }
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
        if (!all) {
          const selectedList: IElementToPractice2[] = JSON.parse(localStorage.getItem(localStorageLabels.selectedListOfETP) ?? '[]');
          const selectedIndex: number = selectedList.findIndex(item => item.id === id);
          if (selectedIndex >= 0) {
            selectedList.splice(selectedIndex, 1);
            localStorage.setItem(localStorageLabels.selectedListOfETP, JSON.stringify(selectedList));
          }
          this._notificationSvc.success('Success', 'Element to practice deleted successfully.');
        }
        // this._practiceListsSvc.getFilteredPracticeList({ list: [id] }).subscribe(
        //   (practiceLists) => {
        //     practiceLists.forEach( 
        //       practiceListItem => {
        //         if (practiceListItem.list.length > 1) {
        //           const { list } = practiceListItem;
        //           list.splice(list.findIndex( item => item === id), 1);
        //           this._practiceListsSvc.updatePracticeList(practiceListItem.id, { ...practiceListItem, list })
        //         } else {
        //           this._practiceListsSvc.deletePracticeList(id)
        //             .then( 
        //               () => this._notificationSvc.success(
        //                   'Practice list deleted successfully',
        //                   `The practice list ${ practiceListItem.title.toUpperCase() } was deleted successfully.`
        //                 ) 
        //             )
        //             .catch(
        //               () => this._notificationSvc.error(
        //                   'There was an error',
        //                   `Something went wrong so we were not able to delete the practice list ${practiceListItem.title.toUpperCase()} `
        //                 )
        //             )
        //         }
        //       }
        //     )
        //   }
        // )
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
    JSON.parse(localStorage.getItem(localStorageLabels.selectedListOfETP) ?? '[]').forEach((item: any) => this.elementToPracticeDelete(item.id, true));
    localStorage.removeItem(localStorageLabels.selectedListOfETP);
    this._notificationSvc.success('Success', 'All the selected elements to practice were deleted successfully.');
  }
}
