import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ModulesService } from './modules.service';
import { localStorageLabels, RoutesApp } from '../../../../enums';
import { IContentHeaderInfoItem, IPageTableInfo, IModule, ITableItem, TModuleChangeState } from '../../../../interfaces';

import { ContentHeaderComponent } from '../components/content-header/content-header.component';
import { TableComponent } from '../components/table/table.component';

import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-modules',
  imports: [ContentHeaderComponent, TableComponent],
  templateUrl: './modules.component.html',
  styleUrl: './modules.component.css'
})
export class ModulesComponent implements OnInit {
  public contentHeaderInfo: IContentHeaderInfoItem = {
    add: {
      label: 'Add',
      title: 'Add',
      route: `/${RoutesApp.modules}/${RoutesApp.add}`,
    },
    title: 'modules',
  };

  public modules: IModule[] | null = null;

  public page: IPageTableInfo | any = {
    index: 1,
    size: 10,
  };

  get localLanguage(): string { return localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en' };

  get tableInfo(): Array<ITableItem> {
    const en = this.localLanguage === 'en';
    return [
      {
        header: en ? 'Label' : 'Etiqueta',
        key: en ? 'label.en' : 'label.es',
      },
      {
        header: en ? 'Title' : 'Título',
        key: en ? 'title.en' : 'title.es',
      },
      {
        header: en ? 'Description' : 'Descripción',
        key: 'description',
      },
      {
        header: en ? 'Icon' : 'Icono',
        key: 'icon',
      },
      {
        header: en ? 'Created At' : 'Creado En',
        key: 'createdAt',
      },
      {
        header: en ? 'Last Update' : 'Última Actualización',
        key: 'lastUpdate',
      },
      {
        header: en ? 'State' : 'Estado',
        key: 'state',
      },
    ]
  };

  constructor(
    private _router: Router,
    private _moduleSvc: ModulesService,
    private _notificationSvc: NzNotificationService
  ) { }

  ngOnInit(): void {
    this.getModules();
  }

  public getModules(query?: any, options?: any): void {
    if (!query) localStorage.removeItem(localStorageLabels.module.filerBody);
    this._moduleSvc
      .getFilteredModules(query)
      .subscribe(
        (modules) => {
          console.log({ modules });
          this.modules = modules;
        },
        error => {
          console.error({ error });
          this.modules = [];
        }
      );
  }

  public moduleEdit(id: string): void {
    this._router.navigate([
      `/${RoutesApp.modules}/${RoutesApp.add}/${id}`,
    ]);
  }

  public moduleDelete(id: string, all?: boolean): void {
    this._moduleSvc
      .deleteModule(id)
      .then(
        (deleteResponse) => {
          if (!all) {
            const selectedList: IModule[] = JSON.parse(localStorage.getItem(localStorageLabels.module.selectedList) ?? '[]');
            const selectedIndex: number = selectedList.findIndex(item => item.id === id);
            if (selectedIndex >= 0) {
              selectedList.splice(selectedIndex, 1);
              localStorage.setItem(localStorageLabels.module.selectedList, JSON.stringify(selectedList));
            }
            this._notificationSvc.success('Success', 'module deleted successfully.');
          }
        }
      )
      .catch(
        (error) => {
          console.log({ error });
          this._notificationSvc.error('Error', 'There was an error and we were not able to delete the module.');
        }
      )
  }


  public deleteAll(event: any): void {
    JSON.parse(localStorage.getItem(localStorageLabels.module.selectedList) ?? '[]').forEach((item: any) => this.moduleDelete(item.id, true));
    localStorage.removeItem(localStorageLabels.module.selectedList);
    this._notificationSvc.success('Success', 'All the selected modules were deleted successfully.');
  }

  public errorResponse(msg?: string): NzNotificationRef {
    return this._notificationSvc.error('Error', msg ?? ' Something went wrong. Please try again ');
  }

  public changeState({ id, state }: TModuleChangeState): Promise<NzNotificationRef> {
    const { loading } = localStorageLabels;
    localStorage.setItem(loading, loading);
    return this._moduleSvc.updateModule(id, { state }).then(changeStateResponse => {
      console.log({ changeStateResponse });
      const selectedList: Array<IModule> = JSON.parse(localStorage.getItem(localStorageLabels.module.selectedList) ?? '[]');

      if (selectedList.length > 0) {
        const selectedItemIndex: number = selectedList.findIndex(item => item.id === id);
        if (selectedItemIndex >= 0) {
          selectedList[selectedItemIndex] = { ...selectedList[selectedItemIndex], state };
          localStorage.setItem(localStorageLabels.module.selectedList, JSON.stringify(selectedList));
        }
      }

      return this._notificationSvc.success(' State Changend ', ' The state of module was changed successfully ');
    }).catch(error => {
      console.error({ error });
      return this.errorResponse(' There was an error so we were not able to change the state of the module. Please try again ');
    }).finally(() => localStorage.removeItem(loading));
  }

}
