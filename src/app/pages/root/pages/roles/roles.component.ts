import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { RolesService } from './roles.service';
import { localStorageLabels, RoutesApp } from '../../../../enums';
import { IContentHeaderInfoItem, IPageTableInfo, IRole, ITableItem, TRoleChangeState } from '../../../../interfaces';

import { ContentHeaderComponent } from '../components/content-header/content-header.component';
import { TableComponent } from '../components/table/table.component';

import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-roles',
  imports: [ContentHeaderComponent, TableComponent],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent implements OnInit {
  public contentHeaderInfo: IContentHeaderInfoItem = {
    add: {
      label: 'Add',
      title: 'Add',
      route: `/${RoutesApp.roles}/${RoutesApp.add}`,
    },
    title: 'Roles',
  };

  public tableInfo: Array<ITableItem> = [
    {
      header: 'Name',
      key: `name`,
    },
    {
      header: 'Description',
      key: 'description',
    },
    {
      header: 'Created At',
      key: 'createdAt',
    },
    {
      header: 'Last Update',
      key: 'lastUpdate',
    },
    {
      header: 'State',
      key: 'state',
    },
  ];

  public roles: IRole[] | null = null;

  public page: IPageTableInfo | any = {
    index: 1,
    size: 10,
  };

  constructor(
    private _router: Router,
    private _roleSvc: RolesService,
    private _notificationSvc: NzNotificationService
  ) { }

  ngOnInit(): void {
    this.getRoles();
  }

  public getRoles(query?: any, options?: any): void {
    if (!query) localStorage.removeItem(localStorageLabels.role.filerBody);
    this._roleSvc
      .getFilteredRoles(query)
      .subscribe(
        (roles) => {
          console.log({ roles });
          this.roles = roles;
        },
        error => {
          console.error({ error });
          this.roles = [];
        }
      );
  }

  public roleEdit(id: string): void {
    this._router.navigate([
      `/${RoutesApp.roles}/${RoutesApp.add}/${id}`,
    ]);
  }

  public roleDelete(id: string, all?: boolean): void {
    this._roleSvc
      .deleteRole(id)
      .then(
        (deleteResponse) => {
          if (!all) {
            const selectedList: IRole[] = JSON.parse(localStorage.getItem(localStorageLabels.role.selectedList) ?? '[]');
            const selectedIndex: number = selectedList.findIndex(item => item.id === id);
            if (selectedIndex >= 0) {
              selectedList.splice(selectedIndex, 1);
              localStorage.setItem(localStorageLabels.role.selectedList, JSON.stringify(selectedList));
            }
            this._notificationSvc.success('Success', 'Role deleted successfully.');
          }
        }
      )
      .catch(
        (error) => {
          console.log({ error });
          this._notificationSvc.error('Error', 'There was an error and we were not able to delete the role.');
        }
      )
  }


  public deleteAll(event: any): void {
    JSON.parse(localStorage.getItem(localStorageLabels.role.selectedList) ?? '[]').forEach((item: any) => this.roleDelete(item.id, true));
    localStorage.removeItem(localStorageLabels.role.selectedList);
    this._notificationSvc.success('Success', 'All the selected roles were deleted successfully.');
  }

  public errorResponse(msg?: string): NzNotificationRef {
    return this._notificationSvc.error('Error', msg ?? ' Something went wrong. Please try again ');
  }

  public changeState({ id, state }: TRoleChangeState): Promise<NzNotificationRef> {
    const { loading } = localStorageLabels;
    localStorage.setItem(loading, loading);
    return this._roleSvc.updateRole(id, { state }).then(changeStateResponse => {
      console.log({ changeStateResponse });
      const selectedList: Array<IRole> = JSON.parse(localStorage.getItem(localStorageLabels.role.selectedList) ?? '[]');

      if (selectedList.length > 0) {
        const selectedItemIndex: number = selectedList.findIndex(item => item.id === id);
        if (selectedItemIndex >= 0) {
          selectedList[selectedItemIndex] = { ...selectedList[selectedItemIndex], state };
          localStorage.setItem(localStorageLabels.role.selectedList, JSON.stringify(selectedList));
        }
      }

      return this._notificationSvc.success(' State Changend ', ' The state of Role was changed successfully ');
    }).catch(error => {
      console.error({ error });
      return this.errorResponse(' There was an error so we were not able to change the state of the Role. Please try again ');
    }).finally(() => localStorage.removeItem(loading));
  }

}
