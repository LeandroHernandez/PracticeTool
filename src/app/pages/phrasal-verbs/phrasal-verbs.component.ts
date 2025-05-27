import { Component, OnInit } from '@angular/core';
import { IContentHeaderInfoItem, ITableItem } from '../../interfaces';
import { RoutesApp } from '../../constants';
import { Router } from '@angular/router';
import { ElementToPracticeService } from '../components/add-element-to-prectice/element-to-practice.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ContentHeaderComponent } from '../components/content-header/content-header.component';
import { TableComponent } from '../components/table/table.component';
import { TypeService } from '../types/types.service';

@Component({
  selector: 'app-phrasal-verbs',
  imports: [ContentHeaderComponent, TableComponent],
  templateUrl: './phrasal-verbs.component.html',
  styleUrl: './phrasal-verbs.component.css'
})
export class PhrasalVerbsComponent implements OnInit{

  public contentHeaderInfo: IContentHeaderInfoItem = {
    add: {
      label: 'Add Phrasal Verb',
      title: 'Add Phrasal Verb',
      route: `/${RoutesApp.phrasalVerbs}/${RoutesApp.addPhrasalVerb}`,
    },
    title: 'Phrasal Verbs',
    test: {
      label: 'Phrasal Verb Test',
      title: 'Phrasal Verb Test',
      // route: `/${RoutesApp.phrasalVerbs}/${RoutesApp.testPhrasalVerbs}`,
      route: `/${RoutesApp.phrasalVerbs}/${RoutesApp.test}`,
      disabled: true,
    },
  }

  public tableInfo: Array<ITableItem> = [
    {
      header: 'Basic',
      key: 'en'
    },
    {
      header: 'Meaning',
      key: 'es'
    },
  ]
  // public itemList: Array<IphrasalVerb> = [];
  public itemList: Array<any> | null = null;
  public phrasalVerbTypeId: string = '';

  constructor (
    private _router: Router, 
    private _typeServiceSvc: TypeService, 
    private _elementToPracticeSvc: ElementToPracticeService, 
    private _notificationSvc: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.getPhrasalVerbType();
  }
  
  public getPhrasalVerbType(): void {
    this._typeServiceSvc.getTypesByField('name', 'Phrasal Verb').subscribe(
      (phrasalVerbTypeId) => {
        console.log({ phrasalVerbTypeIdRESPONSE: this.phrasalVerbTypeId });
        this.phrasalVerbTypeId = phrasalVerbTypeId[0].id;
        this.getPhrasalVerbs();
      }
    )
  }
  
  public getPhrasalVerbs( query?: any, options?: any ): void {
    console.log({ phrasalVerbTypeId: this.phrasalVerbTypeId });
    this._elementToPracticeSvc.getFilteredElementsToPractice( { type: this.phrasalVerbTypeId, ...query }, options ?? undefined ).subscribe(
      (phrasalVerbs) => {
        this.itemList = phrasalVerbs;
        if (phrasalVerbs.length > 0) {
          this.contentHeaderInfo.test.disabled = false;
        }
        console.log({phrasalVerbs});
      }, (error) => {
        console.log({error});
      }
    )
  };

  public phrasalVerbEdit(id: string): void {
    this._router.navigate([`/${RoutesApp.phrasalVerbs}/${RoutesApp.addPhrasalVerb}/${id}`])
  }

  public phrasalVerbDelete(id: any): void {
    this._elementToPracticeSvc.deleteElementToPractice(id)
    .then(
      (deleteResponse) => {
        console.log({deleteResponse});
        this._notificationSvc.success('Success', 'Phrasal Verb deleted successfully.');
      }
    )
    .catch(
      (error) => {
        console.log({error});
        this._notificationSvc.error('Error', 'There was an error and we were not able to delete the Phrasal Verb.');
      }
    )
  }
}
