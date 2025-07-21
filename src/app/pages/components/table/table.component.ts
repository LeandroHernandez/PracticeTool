import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FiltersComponent } from './filters/filters.component';

import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

import { IWord } from '../../../interfaces/word.interface';
import { ITableItem } from '../../../interfaces/table-item.interface';
import { IFilterFormField } from '../../../interfaces/filter-form-field.interface';
import { IElementToPractice, IPageTableInfo } from '../../../interfaces';
import { localStorageLabels } from '../../../constants';

@Component({
  selector: 'app-table',
  imports: [
    NzPopconfirmModule,
    NzModalModule,
    NzTableModule,
    NzPaginationModule,
    NzCheckboxModule,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent {
  // @Input() tableHeader: Array<string> = [];
  @Input() filterFormFields: Array<IFilterFormField> = [];
  @Input() tableInfo: Array<ITableItem> = [];
  @Input() page: IPageTableInfo = { index: 1, size: 10 };
  @Input() itemList: Array<any> = [];
  // @Input() setOfCheckedId: Set<number> = new Set<number>();

  @Input() pageEmitter: EventEmitter<IPageTableInfo> = new EventEmitter();
  @Output() filterAction: EventEmitter<IElementToPractice | null> =
    new EventEmitter();
  @Output() editAction: EventEmitter<string> = new EventEmitter();
  @Output() deleteAction: EventEmitter<string> = new EventEmitter();
  @Output() deleteAllAction: EventEmitter<boolean> = new EventEmitter();
  // @Output() setOfCheckedIdsEmitter: EventEmitter<Set<number>> =
  //   new EventEmitter();

  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<number>();

  constructor(private _nzModalSvc: NzModalService) {
    localStorage.removeItem(localStorageLabels.selectedListOfETP);
  }

  public get paginatedItems(): Array<any> {
    const { index, size } = this.page;
    const sheet: number = size * index;
    return this.itemList.slice(sheet - size, sheet);
  }

  public getItemIndex(i: number): number {
    const item = this.itemList.findIndex((item) => item.id === i);
    return item < 0 ? 0 : item + 1;
  }

  onAllChecked(checked: boolean): void {
    // console.log({ allCheckedFunc: { checked } });
    // this.listOfCurrentPageData
    //   .filter(({ disabled }) => !disabled)
    this.paginatedItems
      // .filter(({ disabled }) => !disabled)
      .forEach(({ id }) => this.updateCheckedSet(id, checked));
    this.refreshCheckedStatus();
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  refreshCheckedStatus(): void {
    // const listOfEnabledData = this.listOfCurrentPageData.filter(({ disabled }) => !disabled);
    this.checked = this.paginatedItems.every(({ id }) =>
      this.setOfCheckedId.has(id)
    );
    this.indeterminate =
      this.paginatedItems.some(({ id }) => this.setOfCheckedId.has(id)) &&
      !this.checked;
    // this.setOfCheckedIdsEmitter.emit(this.setOfCheckedId);
    this.setSelectedList();
  }

  public setSelectedList(): void {
    const selectedList = this.itemList.filter((item) =>
      this.setOfCheckedId.has(item.id)
    );

    if (selectedList.length === 0)
      return localStorage.removeItem(localStorageLabels.selectedListOfETP);

    return localStorage.setItem(
      localStorageLabels.selectedListOfETP,
      JSON.stringify(selectedList)
    );
  }

  onItemChecked(id: number, checked: boolean): void {
    // console.log({ itemCheckedFunc: { id, checked } });6
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  // public selectedItems(array1, array2) {
  public get selectedItems(): boolean {
    return this.paginatedItems.every((item) => {
      return this.setOfCheckedId.has(item.id);
    });
  }

  public getKeys(item: IWord): Array<string> {
    console.log({ item });
    // delete item.id
    return Object.keys(item);
  }

  public getClass(item: any, keyItem: ITableItem): string {
    const key: string = keyItem.key;

    if (!item[keyItem.key]) {
      if (
        key === 'simplePresent' ||
        key === 'simplePast' ||
        key === 'pastParticiple'
      ) {
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

    if (key.endsWith('irregular')) {
      return valueItem ? 'Irregular' : 'Regular';
    } else if (!valueItem) {
      // if (item.verbInfo.wordType.id !== 'cieWObetRIxQzKFddEg4') {
      //   return '----'
      // }

      const verbInfo: string = 'verbInfo';
      if (
        key === `${verbInfo}.simplePresent` ||
        key === `${verbInfo}.simplePast` ||
        key === `${verbInfo}.pastParticiple`
      ) {
        return 'Empty';
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
      nzFooter: null,
    });

    const instance = modal.getContentComponent();
    instance.filterFormFields = this.filterFormFields;

    instance.valueFormEmitter.subscribe((value: any) => {
      console.log('Cambio en filtros:', value);
      this.filterAction.emit(value);
    });
  }

  public paginationChange(): void {
    // return this.pageEmitter.emit(this.page);
    this.pageEmitter.emit(this.page);
    this.refreshCheckedStatus();
  }
}
