import { Component } from '@angular/core';
import { ContentHeaderComponent } from '../components/content-header/content-header.component';
import { TableComponent } from '../components/table/table.component';
import { IContentHeaderInfoItem, IFilterFormField, ITableItem } from '../../interfaces';
import { RoutesApp } from '../../constants';
import { Router } from '@angular/router';
import { ExpressionsService } from './expressions.service';
import { ElementToPracticeService } from '../components/add-element-to-prectice/element-to-practice.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-expressions',
  imports: [ ContentHeaderComponent, TableComponent ],
  templateUrl: './expressions.component.html',
  styleUrl: './expressions.component.css'
})
export class ExpressionsComponent {

  public contentHeaderInfo: IContentHeaderInfoItem = {
    add: {
      label: 'Add Expression',
      title: 'Add Expression',
      route: `/${RoutesApp.expressions}/${RoutesApp.addExpression}`,
    },
    title: 'Expressions',
    test: {
      label: 'Expression Test',
      title: 'Expression Test',
      // route: `/${RoutesApp.expressions}/${RoutesApp.testexpressions}`,
      route: `/${RoutesApp.expressions}/${RoutesApp.test}`,
      disabled: true,
    },
  }

  public expressionTypebId: string = 'p3N5Zd4nJVIPTozkJGUm';
  // public verbId: string = 'cieWObetRIxQzKFddEg4';

  public filterFormFields: Array<IFilterFormField> = [
    {
      type: 'text',
      label: 'Basic',
      key: 'en',
      placeholder: 'Basic',
    },
    {
      type: 'subForm',
      label: '',
      key: 'verbInfo',
      // subForm: [
      //   {
      //     type: 'switch',
      //     label: 'Irregular',
      //     key: 'irregular',
      //     placeholder: 'Irregular',
      //     switchInfo: {
      //       checked: 'Irregular',
      //       unChecked: 'Regular',
      //     }
      //   },
      //   {
      //     type: 'select',
      //     label: 'Type',
      //     key: 'expressionType',
      //     placeholder: 'Type',
      //     intialValue: this.verbId
      //   },
      //   {
      //     type: 'text',
      //     label: 'Simple Present',
      //     key: 'simplePresent',
      //     placeholder: 'Simple Present',
      //   },
      //   {
      //     type: 'text',
      //     label: 'Simple Past',
      //     key: 'simplePast',
      //     placeholder: 'Simple Past',
      //   },
      //   {
      //     type: 'text',
      //     label: 'PastParticiple',
      //     key: 'pastParticiple',
      //     placeholder: 'Past Participle',
      //   },
      // ]
    }
  ];
  
  // public verbInfoKey: string = 'verbInfo';

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
  // public itemList: Array<Iexpression> = [];
  public itemList: Array<any> | null = null;

  constructor (
    private _router: Router, 
    // private _expressionSvc: ExpressionsService, 
    // private _typeServiceSvc: TypeService, 
    private _elementToPracticeSvc: ElementToPracticeService, 
    private _notificationSvc: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.getExpressions();
    // this.getexpressionTypes();
  }
  
  public getExpressions( query?: any, options?: any ): void {
    this._elementToPracticeSvc.getFilteredElementsToPractice( { type: this.expressionTypebId, ...query }, options ?? undefined ).subscribe(
      (expressions) => {
        this.itemList = expressions;
        if (expressions.length > 0) {
          this.contentHeaderInfo.test.disabled = false;
        }
        // console.log({expressions});
      }, (error) => {
        console.log({error}); 
      }
    )
    console.log({ query });
    // this._elementToPracticeSvc.getFilteredElementsToPractice( query ?? null ).subscribe(
    //   (expressions) => {
    //     this.itemList = expressions;
    //     console.log({expressions});
    //   }, (error) => {
    //     console.log({error});
    //   }
    // )
  };
  
  // public getexpressionTypes(): void {
  //   this._typeServiceSvc.getTypesByFather(this.expressionTypebId).subscribe(
  //     (types) => {
  //       this.filterFormFields = this.filterFormFields.map((item) => {
  //         item.subForm?.map(
  //           (subFormItem) => {
  //             if (subFormItem.key === 'expressionType') {
  //               subFormItem.selectOptions = types;
  //             }
  //             return subFormItem;
  //           }
  //         )
  //         return item;
  //       }) 
  //       console.log({types});
  //     }, (error) => {
  //       console.log({error});
  //     }
  //   )
  // };

  public expressionEdit(id: string): void {
    this._router.navigate([`/${RoutesApp.expressions}/${RoutesApp.addExpression}/${id}`])
  }

  public expressionDelete(id: string): void {
    this._elementToPracticeSvc.deleteElementToPractice(id)
    .then(
      (deleteResponse) => {
        console.log({deleteResponse});
        this._notificationSvc.success('Success', 'Expression deleted successfully.');
      }
    )
    .catch(
      (error) => {
        console.log({error});
        this._notificationSvc.error('Error', 'There was an error and we were not able to delete the expression.');
      }
    )
  }
}
