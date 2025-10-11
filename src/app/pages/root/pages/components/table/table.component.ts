import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IElementToPractice,
  IPageTableInfo,
  TRoleChangeState,
  IFilterFormField,
  ITableItem,
  IWord,
} from '../../../../../interfaces';
import { localStorageLabels, RoutesApp } from '../../../../../enums';

import { FiltersComponent } from './filters/filters.component';

import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-table',
  imports: [
    DatePipe,
    FormsModule,
    NzPopconfirmModule,
    NzModalModule,
    NzTableModule,
    NzPaginationModule,
    NzCheckboxModule,
    NzSwitchModule,
    NzIconModule,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent implements OnInit {
  @Input() filterFormFields: Array<IFilterFormField> | null = null;
  @Input() tableInfo: Array<ITableItem> = [];
  @Input() page: IPageTableInfo = { index: 1, size: 10 };
  @Input() itemList: Array<any> | null = null;

  @Input() pageEmitter: EventEmitter<IPageTableInfo> = new EventEmitter();
  @Output() filterAction: EventEmitter<IElementToPractice | null> =
    new EventEmitter();
  @Output() editAction: EventEmitter<string> = new EventEmitter();
  @Output() deleteAction: EventEmitter<string> = new EventEmitter();
  @Output() deleteAllAction: EventEmitter<boolean> = new EventEmitter();
  @Output() changeStateEmitter: EventEmitter<{ id: string; state: any }> =
    new EventEmitter();
  setOfCheckedId = new Set<number>();

  // public actualLabel: string = localStorageLabels.etp.selectedList;
  get actualLabel(): string {
    const urlA: string[] = this._router.url.split('/');
    switch (urlA[urlA.length - 1]) {
      case RoutesApp.practiceLists:
        return localStorageLabels.pl.selectedList;
        break;

      case RoutesApp.roles:
        return localStorageLabels.role.selectedList;
        break;

      default:
        return localStorageLabels.etp.selectedList;
        break;
    }
  }

  get paginatedItems(): Array<any> {
    if (!this.itemList) return [];
    const { index, size } = this.page;
    const sheet: number = size * index;
    return this.itemList.slice(sheet - size, sheet);
  }

  get checked(): boolean {
    return (
      this.paginatedItems.length > 0 &&
      this.paginatedItems.every((item) => {
        return this.setOfCheckedId.has(item.id);
      })
    );
  }

  get indeterminate(): boolean {
    return (
      !this.checked &&
      this.paginatedItems.some(({ id }) => this.setOfCheckedId.has(id))
    );
  }

  get url(): string {
    return this._router.url;
  }

  get actualSelectedItems(): any[] {
    return JSON.parse(localStorage.getItem(this.actualLabel) ?? '[]');
  }

  get actualFilterLabel(): string {
    return this.url.split('/')[1] === RoutesApp.elementsToPractice
      ? localStorageLabels.etp.filerBody
      : localStorageLabels.pl.filerBody;
  }

  get actualSelectedFilters(): Object | null {
    return JSON.parse(localStorage.getItem(this.actualFilterLabel) ?? 'null');
  }

  constructor(private _router: Router, private _nzModalSvc: NzModalService) {}

  ngOnInit(): void {
    for (const item of this.actualSelectedItems) {
      this.setOfCheckedId.add(item.id);
    }
  }

  getItemIndex(i: number): number | void {
    if (!this.itemList) return;
    const item = this.itemList.findIndex((item) => item.id === i);
    return item < 0 ? 0 : item + 1;
  }

  public onAllChecked(checked: boolean): void {
    this.paginatedItems.forEach(({ id }) => this.updateCheckedSet(id, checked));
  }

  public updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
    return this.setSelectedList();
  }

  public setSelectedList(): void {
    if (!this.itemList) return;
    const selectedList = this.itemList.filter((item) =>
      this.setOfCheckedId.has(item.id)
    );

    if (selectedList.length === 0)
      return localStorage.removeItem(this.actualLabel);

    return localStorage.setItem(this.actualLabel, JSON.stringify(selectedList));
  }

  public onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
  }

  getKeys(item: IWord): Array<string> {
    console.log({ item });
    return Object.keys(item);
  }

  getClass(item: any, keyItem: ITableItem): string {
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

  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  getValue(item: any, keyItem: ITableItem): string {
    const key: string = keyItem.key;
    const valueItem: any = this.getNestedValue(item, key);

    if (key.endsWith('irregular')) {
      return valueItem ? 'Irregular' : 'Regular';
    } else if (!valueItem) {
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

  public clearFilters(): void {
    localStorage.removeItem(this.actualFilterLabel);
    return this.filterAction.emit(undefined);
  }

  public clearSelectedItems(): void {
    this.setOfCheckedId.clear();
    return localStorage.removeItem(this.actualLabel);
  }

  public paginationChange(): void {
    this.pageEmitter.emit(this.page);
  }

  public changeState({ id, state }: TRoleChangeState): void {
    console.log({ id, state });
    return this.changeStateEmitter.emit({ id, state });
  }
}
