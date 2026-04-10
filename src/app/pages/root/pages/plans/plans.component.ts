import { Component, OnInit } from '@angular/core';
import { localStorageLabels, RoutesApp } from '../../../../enums';
import { Router, RouterLink } from '@angular/router';
import { TableComponent } from '../components/table/table.component';
import { IPageTableInfo, ITableItem } from '../../../../interfaces';
import { IPlan, TPlanChangeState } from '../../../../interfaces/plan.interface';
import { PlansService } from './plans.service';
import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-plans',
  imports: [RouterLink, TableComponent],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.css'
})
export class PlansComponent implements OnInit {

  public plans: IPlan[] = [];

  public page: IPageTableInfo | any = {
    index: 1,
    size: 10,
  };

  get en(): boolean {
    const en = localStorage.getItem(localStorageLabels.localCurrentLanguage);
    return en === 'en'
  }

  get tableInfo(): Array<ITableItem> {

    return [
      {
        header: this.en ? 'Title' : 'Titulo',
        // key: `title[${this.en ? 'en' : 'es'}]`,
        key: `title.${this.en ? 'en' : 'es'}`,
      },
      {
        header: this.en ? 'Description' : 'Descripción',
        key: `description.${this.en ? 'en' : 'es'}`,
      },
      {
        header: this.en ? 'Price' : 'Precio',
        key: `price`,
      },
      {
        header: this.en ? 'Features' : 'Caracterisiticas',
        key: `features.length`,
      },
      {
        header: this.en ? 'Created At' : 'Creado',
        key: 'createdAt',
      },
      {
        header: this.en ? 'Last Update' : 'Ultima Actualización',
        key: 'lastUpdate',
      },
      {
        header: this.en ? 'State' : 'Estado',
        key: 'state',
      },
    ];
  }

  constructor(
    private _router: Router,
    private _planSvc: PlansService,
    private _notificationSvc: NzNotificationService
  ) { }

  ngOnInit(): void {
    this.getPlans();
  }

  public getPlans(query?: any, options?: any): void {
    if (!query) localStorage.removeItem(localStorageLabels.plan.filerBody);
    this._planSvc
      .getFilteredPlans(query)
      .subscribe(
        (plans) => {
          console.log({ plans });
          this.plans = plans;
        },
        error => {
          console.error({ error });
          this.plans = [];
        }
      );
  }

  public planEdit(id: string): void {
    this._router.navigate([
      `/${RoutesApp.plans}/${RoutesApp.add}/${id}`,
    ]);
  }

  public planDelete(id: string, all?: boolean): void {
    this._planSvc
      .deletePlan(id)
      .then(
        (deleteResponse) => {
          if (!all) {
            const selectedList: IPlan[] = JSON.parse(localStorage.getItem(localStorageLabels.plan.selectedList) ?? '[]');
            const selectedIndex: number = selectedList.findIndex(item => item.id === id);
            if (selectedIndex >= 0) {
              selectedList.splice(selectedIndex, 1);
              localStorage.setItem(localStorageLabels.plan.selectedList, JSON.stringify(selectedList));
            }
            this._notificationSvc.success('Success', 'Plan deleted successfully.');
          }
        }
      )
      .catch(
        (error) => {
          console.log({ error });
          this._notificationSvc.error('Error', 'There was an error and we were not able to delete the Plan.');
        }
      )
  }


  public deleteAll(event: any): void {
    JSON.parse(localStorage.getItem(localStorageLabels.plan.selectedList) ?? '[]').forEach((item: any) => this.planDelete(item.id, true));
    localStorage.removeItem(localStorageLabels.plan.selectedList);
    this._notificationSvc.success('Success', 'All the selected Plans were deleted successfully.');
  }

  public errorResponse(msg?: string): NzNotificationRef {
    return this._notificationSvc.error('Error', msg ?? ' Something went wrong. Please try again ');
  }

  public changeState({ id, state }: TPlanChangeState): Promise<NzNotificationRef> {
    const { loading } = localStorageLabels;
    localStorage.setItem(loading, loading);
    return this._planSvc.updatePlan(id, { state }).then(changeStateResponse => {
      // console.log({ changeStateResponse });
      const selectedList: Array<IPlan> = JSON.parse(localStorage.getItem(localStorageLabels.plan.selectedList) ?? '[]');

      if (selectedList.length > 0) {
        const selectedItemIndex: number = selectedList.findIndex(item => item.id === id);
        if (selectedItemIndex >= 0) {
          selectedList[selectedItemIndex] = { ...selectedList[selectedItemIndex], state };
          localStorage.setItem(localStorageLabels.plan.selectedList, JSON.stringify(selectedList));
        }
      }

      return this._notificationSvc.success(' State Changend ', ' The state of Plan was changed successfully ');
    }).catch(error => {
      console.error({ error });
      return this.errorResponse(' There was an error so we were not able to change the state of the Plan. Please try again ');
    }).finally(() => localStorage.removeItem(loading));
  }

}
