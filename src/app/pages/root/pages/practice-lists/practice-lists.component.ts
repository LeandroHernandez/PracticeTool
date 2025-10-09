import { Component, OnInit } from '@angular/core';
import { TableComponent } from '../components/table/table.component';
import { ContentHeaderComponent } from '../components/content-header/content-header.component';
import { IContentHeaderInfoItem, IPracticeList, ITableItem } from '../../../../interfaces';
import { localStorageLabels, RoutesApp } from '../../../../enums';
import { IFilterFormField } from '../../../../interfaces/filter-form-field.interface';
import { PracticeListsService } from './practice-lists.service';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-practice-lists',
  imports: [ ContentHeaderComponent, TableComponent ],
  templateUrl: './practice-lists.component.html',
  styleUrl: './practice-lists.component.css'
})
export class PracticeListsComponent implements OnInit {

  public contentHeaderInfo: IContentHeaderInfoItem = {
    add: {
      label: 'Add Practice List',
      title: 'Add Practice List',
      route: `/${RoutesApp.practiceLists}/${RoutesApp.add}`,
    },
    title: 'Practice Lists',
    test: {
      label: 'Practice List Test',
      title: 'Practice List Test',
      // route: `/${RoutesApp.practiceLists}/${RoutesApp.test}`,
      practiceList: true
    },
  }

  // public wordTypebId: string = 'TBKrgXIeg2LaUrMLhD0T';
  // public verbId: string = 'cieWObetRIxQzKFddEg4';

  public filterFormFields: Array<IFilterFormField> = [
    {
      type: 'text',
      label: 'Title',
      key: 'title',
      placeholder: 'Title of practice list',
    },
  ];

  public verbInfoKey: string = 'verbInfo';

  public tableInfo: Array<ITableItem> = [
    // {
    //   header: 'Created By',
    //   key: `createdBy`
    // },
    {
      header: 'Title',
      key: 'title'
    },
    {
      header: 'Number of items',
      key: 'list'
    },
  ]
  // public itemList: Array<IWord> = [];
  public itemList: Array<any> | null = null;

  constructor(private _router: Router, private _practiceListsSvc: PracticeListsService, private _notificationSvc: NzNotificationService) {}

  ngOnInit() {
    this.getPracticeLists();
  }

  public getPracticeLists(query?: any ): void {
    // console.log({ query });

    if (!query) localStorage.removeItem(localStorageLabels.pl.filerBody);

    this._practiceListsSvc.getPracticeLists(query).subscribe(
      practiceLists => {
        this.itemList = practiceLists;
      },
      error => {
        console.error({ error });
        this.itemList = [];
      }
    )
  };

  public practiceListEdit(id: string): void {
    this._router.navigate([`/${RoutesApp.practiceLists}/${RoutesApp.add}/${id}`])
  }

  public practiceListDelete(id: string, all?: boolean): void {
    this._practiceListsSvc.deletePracticeList(id)
    .then(
      (deleteResponse) => {
        // console.log({deleteResponse});
        if (!all) {
          const selectedList: IPracticeList[] = JSON.parse(localStorage.getItem(localStorageLabels.pl.selectedList) ?? '[]');
          const selectedIndex: number = selectedList.findIndex(item => item.id === id);
          if (selectedIndex >= 0) {
            selectedList.splice(selectedIndex, 1);
            localStorage.setItem(localStorageLabels.pl.selectedList, JSON.stringify(selectedList));
          }
          this._notificationSvc.success('Success', 'practice list deleted successfully.');
        }
      }
    )
    .catch(
      (error) => {
        console.log({error});
        this._notificationSvc.error('Error', 'There was an error and we were not able to delete the practice list.');
      }
    )
  }
  
  public deleteAll(event: any): void {
    // console.log({ deleteAllEvent: event });
    JSON.parse(localStorage.getItem(localStorageLabels.pl.selectedList) ?? '[]').forEach((item: any) => this.practiceListDelete(item.id, true));
    localStorage.removeItem(localStorageLabels.pl.selectedList);
    this._notificationSvc.success('Success', 'All the selected practice lists were deleted successfully.');
  }

}
