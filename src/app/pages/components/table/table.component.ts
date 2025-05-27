import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FiltersComponent } from './filters/filters.component';

import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

import { IWord } from '../../../interfaces/word.interface';
import { ITableItem } from '../../../interfaces/table-item.interface';
import { IFilterFormField } from '../../../interfaces/filter-form-field.interface';
import { IElementToPractice, IPageTableInfo } from '../../../interfaces';

@Component({
  selector: 'app-table',
  imports: [ NzPopconfirmModule, NzModalModule, NzPaginationModule ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  // @Input() tableHeader: Array<string> = [];
  @Input() filterFormFields: Array<IFilterFormField> = [];
  @Input() tableInfo: Array<ITableItem> = [];
  @Input() page: IPageTableInfo = {
    pageSize: 10,
    startAfterDoc: undefined,
  }
  @Input() itemList: Array<any> | null = null;
  
  @Output() pageEmitter: EventEmitter<IPageTableInfo> = new EventEmitter();
  @Output() filterAction: EventEmitter<IElementToPractice | null> = new EventEmitter();
  @Output() editAction: EventEmitter<string> = new EventEmitter();
  @Output() deleteAction: EventEmitter<string> = new EventEmitter();

  public indexPage: number = 1;

  public getPaginatedList<T>(list: T[], pageSize: number, index: number): T[] {
  if (pageSize <= 0) {
    throw new Error('El tamaño de página debe ser mayor a cero.');
  }

  const start = index * pageSize;
  const end = start + pageSize;
  
  return list.slice(start, end);
}


  public get paginatedItemList(): Array<any> {
    return this.getPaginatedList( this.itemList ?? [], this.page.pageSize ?? 1, this.indexPage - 1 )
  }

  constructor(private _nzModalSvc: NzModalService) {}

  public getKeys(item: IWord): Array<string> {
    console.log({item})
    // delete item.id
    return Object.keys(item);
  } 

  public getClass(item: any, keyItem: ITableItem): string {
    const key: string = keyItem.key;

    if ( !item[keyItem.key] ) {
      if (key === 'simplePresent' || key === 'simplePast' || key === 'pastParticiple') {
        if (item.type !== 'Verb') {
          return 'null';
        } else {
          return 'empty';
        }
      }

    }

    return '';
  }

  public getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }  

  public getValue(item: any, keyItem: ITableItem): string {
    
    // const valueItem: any = item[keyItem.key];
    // const key: string = keyItem.key;
    const key: string = keyItem.key;
    const valueItem: any = this.getNestedValue(item, key);

    if (key.endsWith('irregular') && item.wordType && item.wordType.id === 'cieWObetRIxQzKFddEg4') {
      // return valueItem ? 'Irregular' : 'Regular';
      return valueItem ? 'Irregular' : 'Regular';
    } else if (!valueItem) {
      
      if (item.wordType && item.wordType.id !== 'cieWObetRIxQzKFddEg4') {
        return '----'
      }

      const verbInfo: string = "verbInfo";
      if (key === `${verbInfo}.simplePresent` || key === `${verbInfo}.simplePast` || key === `${verbInfo}.pastParticiple`) {
        return 'Empty'
      } 
    }
    return valueItem;
    
  }

  public show(valueForm: any): void {
    console.log({ valueForm });
  }

  
  public showFiltersModal(): void {
    const modal: NzModalRef = this._nzModalSvc.create({
      nzTitle: 'Filters',
      nzContent: FiltersComponent,
      nzFooter: null
    });

    const instance = modal.getContentComponent();
    instance.filterFormFields = this.filterFormFields;
  
    instance.valueFormEmitter.subscribe((value: any) => {
      console.log('Cambio en filtros:', value);
      this.filterAction.emit(value);
      this.indexPage = 1;
    });
  }
  
  public pagintorChange(event: any): void {
    console.log({event, page: this.page, });
    this.pageEmitter.emit(this.page);
  }

  public itemIndexPosition(i: number) : number {
    const size: number | undefined = this.page.pageSize;
    if (typeof size !== 'number' ) {
      return i;
    }
    // return i * (size / 10);
    return i + ((this.indexPage - 1) * size);
  }
}
