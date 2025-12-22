import { Component } from '@angular/core';
// import { ContentHeaderComponent } from '../components/content-header/content-header.component';
import { TableComponent } from '../components/table/table.component';
import { IContentHeaderInfoItem, IPageTableInfo, ITableItem, IUser, TUserChangeState } from '../../../../interfaces';
import { localStorageLabels, RoutesApp } from '../../../../enums';
import { Router, RouterLink } from '@angular/router';
import { UsersService } from './users.service';
import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-users',
  // imports: [ContentHeaderComponent, TableComponent],
  imports: [RouterLink, TableComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  public contentHeaderInfo: IContentHeaderInfoItem = {
    add: {
      label: 'Add',
      title: 'Add',
      route: `/${RoutesApp.users}/${RoutesApp.add}`,
    },
    title: 'users',
  };

  public tableInfo: Array<ITableItem> = [
    {
      header: 'Names',
      key: `names`,
    },
    {
      header: 'Lastnames',
      key: `lastnames`,
    },
    {
      header: 'Email',
      key: 'email',
    },
    {
      header: 'Role',
      key: 'role.name',
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

  public users: IUser[] | null = null;

  public page: IPageTableInfo | any = {
    index: 1,
    size: 10,
  };

  constructor(
    private _router: Router,
    private _userSvc: UsersService,
    private _notificationSvc: NzNotificationService
  ) { }

  ngOnInit(): void {
    this.getUsers();
  }

  public getUsers(query?: any, options?: any): void {
    if (!query) localStorage.removeItem(localStorageLabels.user.filerBody);
    this._userSvc
      .getFilteredUsers(query)
      .subscribe(
        (users) => {
          this.users = users;
        },
        error => {
          console.error({ error });
          this.users = [];
        }
      );
  }

  public userEdit(id: string): void {
    this._router.navigate([
      `/${RoutesApp.users}/${RoutesApp.add}/${id}`,
    ]);
  }

  public userDelete(id: string, all?: boolean): void {
    this._userSvc
      .deleteUser(id)
      .then(
        (deleteResponse) => {
          if (!all) {
            const selectedList: IUser[] = JSON.parse(localStorage.getItem(localStorageLabels.user.selectedList) ?? '[]');
            const selectedIndex: number = selectedList.findIndex(item => item.id === id);
            if (selectedIndex >= 0) {
              selectedList.splice(selectedIndex, 1);
              localStorage.setItem(localStorageLabels.user.selectedList, JSON.stringify(selectedList));
            }
            this._notificationSvc.success('Success', 'User deleted successfully.');
          }
        }
      )
      .catch(
        (error) => {
          console.log({ error });
          this._notificationSvc.error('Error', 'There was an error and we were not able to delete the user.');
        }
      )
  }


  public deleteAll(event: any): void {
    JSON.parse(localStorage.getItem(localStorageLabels.user.selectedList) ?? '[]').forEach((item: any) => this.userDelete(item.id, true));
    localStorage.removeItem(localStorageLabels.user.selectedList);
    this._notificationSvc.success('Success', 'All the selected users were deleted successfully.');
  }

  public errorResponse(msg?: string): NzNotificationRef {
    return this._notificationSvc.error('Error', msg ?? ' Something went wrong. Please try again ');
  }

  public async changeState({ id, state }: TUserChangeState): Promise<NzNotificationRef> {
    const { loading } = localStorageLabels;
    localStorage.setItem(loading, loading);
    return await this._userSvc.updateUser(id, { state }).then(changeStateResponse => {
      console.log({ changeStateResponse });
      const selectedList: Array<IUser> = JSON.parse(localStorage.getItem(localStorageLabels.user.selectedList) ?? '[]');

      if (selectedList.length > 0) {
        const selectedItemIndex: number = selectedList.findIndex(item => item.id === id);
        if (selectedItemIndex >= 0) {
          selectedList[selectedItemIndex] = { ...selectedList[selectedItemIndex], state };
          localStorage.setItem(localStorageLabels.user.selectedList, JSON.stringify(selectedList));
        }
      }

      return this._notificationSvc.success(' State Changend ', ' The state of user was changed successfully ');
    }).catch(error => {
      console.error({ error });
      return this.errorResponse(' There was an error so we were not able to change the state of the user. Please try again ');
    }).finally(() => localStorage.removeItem(loading));
  }
}
