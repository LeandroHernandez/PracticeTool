import { Component } from '@angular/core';
import { localStorageLabels } from '../../../../../../enums';
import { IElementToPractice, IPageTableInfo, IUse, IVerbInfo } from '../../../../../../interfaces';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

@Component({
  selector: 'app-list',
  imports: [NzTableModule, NzPaginationModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {
  public page: IPageTableInfo = { index: 1, size: 10 };

  get en(): boolean {
    const en = localStorage.getItem(localStorageLabels.localCurrentLanguage);
    return en === 'en';
  }

  get list(): IElementToPractice[] {
    return JSON.parse(localStorage.getItem(localStorageLabels.etp.customSelectedList) ?? '[]');
  }

  get paginatedItems(): Array<IElementToPractice> {
    if (!this.list) return [];
    const { index, size } = this.page;
    const sheet: number = size * index;
    return this.list.slice(sheet - size, sheet);
  }

  get verbPerSheet(): boolean {
    return this.paginatedItems.findIndex(etpItem => {
      if (!etpItem.uses) return false;

      return etpItem.uses.findIndex(item => item.verbInfo) >= 0;
    }) >= 0;
  }

  public getItemIndex(i: string): number | void {
    if (!this.list) return;
    const item = this.list.findIndex((item) => item.id === i);
    return item < 0 ? 0 : item + 1;
  }

  public hasVerb(uses: IUse[]): number {
    return uses.findIndex(use => use.verbInfo);
  }

}
