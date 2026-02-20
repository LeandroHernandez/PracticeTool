import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  IElementToPractice,
  IPageTableInfo,
  TRoleChangeState,
  IFilterFormField,
  ITableItem,
  IWord,
} from '../../../../../interfaces';
import { localStorageLabels, RoleIds, RoutesApp } from '../../../../../enums';

import { RootService } from '../../../root.service';

import { FiltersComponent } from './filters/filters.component';

import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TableService } from './table.service';

@Component({
  selector: 'app-table',
  imports: [
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    NzPopconfirmModule,
    NzModalModule,
    NzTableModule,
    NzPaginationModule,
    NzCheckboxModule,
    NzSwitchModule,
    NzPopoverModule,
    NzIconModule,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent implements OnInit, OnDestroy {
  @Input() filterFormFields: Array<IFilterFormField> | null = null;
  @Input() tableInfo: Array<ITableItem> = [];
  @Input() page: IPageTableInfo = { index: 1, size: 10 };
  @Input() itemList: Array<any> | null = null;
  @Input() pageEmitter: EventEmitter<IPageTableInfo> = new EventEmitter();

  @Output() listEmitter: EventEmitter<Set<number>> = new EventEmitter();
  @Output() filterAction: EventEmitter<IElementToPractice | null> =
    new EventEmitter();
  @Output() editAction: EventEmitter<string> = new EventEmitter();
  @Output() deleteAction: EventEmitter<string> = new EventEmitter();
  @Output() deleteAllAction: EventEmitter<boolean> = new EventEmitter();
  @Output() changeStateEmitter: EventEmitter<{ id: string; state: any }> =
    new EventEmitter();

  public setOfCheckedId = new Set<number>();

  get actualLabel(): string {
    // const urlA: string[] = this._router.url.split('/');
    const urlA: string[] = this.url.split('/');
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
    if (this.url.startsWith(`/${RoutesApp.practiceLists}/${RoutesApp.add}`)) return [];
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

  get localLanguage(): string {
    return localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en';
  }

  get startsWithCondition(): boolean {
    return this.url.startsWith(`/${RoutesApp.practiceLists}/${RoutesApp.add}`);
  }

  public modifyAction: boolean = true;
  public availableToModify: RoleIds[] = [RoleIds.admin];

  public form: FormGroup

  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _rootSvc: RootService,
    private _tableSvc: TableService,
    private _nzModalSvc: NzModalService
  ) {
    const form: FormGroup = this._fb.group({});
    this.tableInfo.filter(item => item.filter).forEach(item => {
      form.addControl(item.key, item.filter === 'text' ? '' : [])
    })
    this.form = form;
  }

  ngOnInit(): void {
    if (this.startsWithCondition) this.modifyAction = false;
    this.getUserInfo();
    // for (const item of this.actualSelectedItems) {
    //   this.setOfCheckedId.add(item.id);
    // }
    this.setInit(this.actualSelectedItems.map(item => item.id));
    this._tableSvc.list$.subscribe(list => {
      if (!list) return;
      if (list.length > 0) { this.setInit(list) } else this.setOfCheckedId = new Set<number>;
    })
  }

  public setInit(idList: any[]): void {
    if (this.startsWithCondition) this.setOfCheckedId.clear();
    for (const id of idList) !this.setOfCheckedId.has(id) ? this.setOfCheckedId.add(id) : false;
  }

  public letters(w: string): string[] {
    return w.split('');
  }

  public getUserInfo(): void {
    this._rootSvc.user$.subscribe(
      userInfo => {
        if (!userInfo) return;
        const { role } = userInfo;
        if (!role) return;
        if (!this.availableToModify.includes(role)) this.modifyAction = false;
      }
    )
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
    if (this.startsWithCondition) return this.listEmitter.emit(this.setOfCheckedId);
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
    return Object.keys(item);
  }

  getClass(item: any, keyItem: ITableItem): string {
    const { key } = keyItem;

    if (item[key] === '' || item[key] === null) return 'empty';

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
    } else if (!valueItem) return this.localLanguage === 'en' ? 'Empty' : 'Vacío';
    return valueItem;
  }

  // public show(valueForm: any): void {
  // }

  public showFiltersModal(): void {
    const modal: NzModalRef = this._nzModalSvc.create({
      nzTitle: 'Filters',
      nzContent: FiltersComponent,
      nzFooter: null,
    });

    const instance = modal.getContentComponent();
    instance.filterFormFields = this.filterFormFields;

    instance.valueFormEmitter.subscribe((value: any) => {
      this.filterAction.emit(value);
    });
  }

  public clearFilters(): void {
    localStorage.removeItem(this.actualFilterLabel);
    return this.filterAction.emit(undefined);
  }

  public clearSelectedItems(): void {
    this.setOfCheckedId.clear();
    if (this.startsWithCondition) return this.listEmitter.emit(this.setOfCheckedId);
    return localStorage.removeItem(this.actualLabel);
  }

  public paginationChange(): void {
    this.pageEmitter.emit(this.page);
  }

  public changeState({ id, state }: TRoleChangeState): void {
    return this.changeStateEmitter.emit({ id, state });
  }

  ngOnDestroy(): void {
    return this._tableSvc.setlist(null);
  }
}
