import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import {
//   FormBuilder,
//   FormControl,
//   FormGroup,
//   ReactiveFormsModule,
//   Validator,
// } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { IElementToPractice2, IPracticeList, IType } from '../../../interfaces';
import { TypeService } from '../../types/types.service';
import { localStorageLabels, RoutesApp } from '../../../constants';
import { Router } from '@angular/router';
import { ElementToPracticeService } from '../../elements-to-practice/element-to-practice.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import { PracticeListsService } from '../../practice-lists/practice-lists.service';
import { TestService } from '../../test/test.service';

interface INode {
  // selected: boolean;
  title: string;
  value: string;
  key: string;
  children?: Array<INode | void>;
  isLeaf?: boolean;
}

@Component({
  selector: 'app-test-confirmation',
  imports: [FormsModule, NzSelectModule, NzTreeSelectModule],
  // imports: [ReactiveFormsModule, NzSelectModule, NzTreeSelectModule],
  templateUrl: './test-confirmation.component.html',
  styleUrl: './test-confirmation.component.css',
})
export class TestConfirmationComponent {
  @Output() closeEmitter: EventEmitter<boolean> = new EventEmitter();

  @Input() practiceList: boolean = false;
  public types: Array<IType> = [];

  // public form: FormGroup;
  public selectedItems: Array<string> = [];
  readonly nodes: Array<any> = [];

  // constructor(private _fb: FormBuilder, private _typeSvc: TypeService) {
  constructor(
    private _router: Router,
    private _testSvc: TestService,
    private _typeSvc: TypeService,
    private _elementToPracticeSvc: ElementToPracticeService,
    private _practiceListsSvc: PracticeListsService,
    private _nzNotificationSvc: NzNotificationService
  ) {
    // this.form = this._fb.group({
    //   selectedItems: [[]],
    //   selectedETP: [true],
    // });
    // this.formInit();
    if (!this.practiceList) this.getTypes();
  }

  get selectedListOfETP(): Array<IElementToPractice2> {
    return JSON.parse(
      localStorage.getItem(localStorageLabels.selectedListOfETP) ?? '[]'
    );
  }

  get selectedListOfPL(): Array<IPracticeList> {
    return JSON.parse(
      localStorage.getItem(localStorageLabels.selectedListOfPL) ?? '[]'
    );
  }

  public getTypes(): void {
    this._typeSvc.getTypes().subscribe(
      (types) => {
        this.types = types;
        // console.log({ types });
        this.buildNodes(types);
        if (this.selectedListOfETP.length > 0)
          this.nodes.push(
            this.buildNode(
              { name: 'Selected elements to practice', id: '1' },
              this.nodes.length
            )
          );
      },
      (error) => {
        console.log({ error });
      }
    );
  }

  // get getNodes(): Array<any> {
  //   return this.types
  //     .filter((item) => !item.father)
  //     .map((typeItem, i) => this.buildNode(typeItem, i));
  // }

  public buildNodes(types: Array<IType>): void {
    // const nodes: Array<INode | void> = types
    types
      .filter((item) => !item.father)
      .forEach((typeItem, i) => this.nodes.push(this.buildNode(typeItem, i)));
    // nodes.forEach((node) => this.nodes.push(node));
  }

  public buildNode(body: IType, i: number, faherKey?: string): INode | void {
    const { name, id } = body;

    if (!id) return;

    let node: INode = {
      // selected: false,
      title: name,
      // value: id,
      // key: `${faherKey ?? '0'}-${i}`,
      value: `${faherKey ?? '0'}-${i}`,
      // key: id,
      key: id,
    };

    const children = this.types
      .filter((item) => item.father === id)
      .map((item, j) => this.buildNode(item, j, node.key));

    if (children.length > 0) {
      node.children = children;
    } else node.isLeaf = true;

    return node;
  }

  public onChange(selectedList: string[]): void | string[] {
    // console.log({selectedList});
    // const selectedOpIndex = selectedList.findIndex( item => item === '1')

    // if ( selectedOpIndex < 0 ) return;

    if ( !selectedList.includes('1') ) return

    // if ( selectedOpIndex + 1 === selectedList.length) return this.selectedItems = ['1'];
    
    // return this.selectedItems = selectedOpIndex + 1 === selectedList.length ? ['1'] : [selectedList[1]];
    return this.selectedItems = selectedList[selectedList.length - 1] === '1' ? ['1'] : [selectedList[1]];
  }
  
  public navigate(error?: boolean): Promise<boolean> | void {
    // this.closeEmitter.emit(true);
    if (!this._testSvc.currentStatus) return;
    console.log('Redireccionando al test');
    return this._router.navigateByUrl(
      `/${ !this.practiceList ? RoutesApp.elementsToPractice : RoutesApp.practiceLists}/${ !error ? RoutesApp.test : ''}`
    );
  }

  public setCustomList(list: any[]): void {
    // console.log({ list });
    const finalList: any[] = [];
    list.forEach(item => { if (!finalList.some(subItem => subItem.id === item.id)) finalList.push(item)});
    return localStorage.setItem(localStorageLabels.customSelectedListOfETP, JSON.stringify(finalList));
  }
  
  public goToTest(): void | Subscription | Promise<boolean> {
    // console.log({
    //   selectedItems: this.selectedItems,
    //   nodes: this.nodes,
    // });

    // console.log({ practiceList: this.practiceList, selectedListOfPL: this.selectedListOfPL });
    if (this.practiceList) {
      if (this.selectedListOfPL.length === 0) return this._practiceListsSvc.getPracticeLists().subscribe(
        (practiceLists) => {
          // console.log({ practiceLists })
          if (practiceLists.length < 1) {
            this._nzNotificationSvc.warning('Without practice lists', 'There are not any practice lists');
            return this.navigate(true);
          }
          // localStorage.setItem(localStorageLabels.customSelectedListOfETP, JSON.stringify([...new Set(practiceLists.flatMap(item => item.list))]));
          this.setCustomList(practiceLists.flatMap(item => item.list));
          return this.navigate();
        }, 
        error => {
          console.log({ error });
          this._nzNotificationSvc.error('Something was wrong', 'We have just had an error, lets try again.');
          return this.navigate(true)
        }
      );

      // localStorage.setItem(localStorageLabels.customSelectedListOfETP, JSON.stringify([...new Set(this.selectedListOfPL)]))
      this.setCustomList(this.selectedListOfPL.flatMap(item => item.list));
      return this.navigate()
    }
    
    const selectedOption: boolean = this.selectedItems[0] === '1';

    // if ( this.selectedItems.length < 1 || selectedOption ) {
    if ( selectedOption ) {
      // if (selectedOption) localStorage.setItem(localStorageLabels.customSelectedListOfETP, JSON.stringify(this.selectedListOfETP))
      // console.log({ selectedOption });
      if (selectedOption) this.setCustomList(this.selectedListOfETP);
      return this.navigate()
    };
    
    // if (this.selectedItems.length > 0) {
    //   // return this._elementToPracticeSvc.getFilteredElementsToPractice({ type: this.selectedItems}).subscribe((filteredEtpsByKind) => console.log({ filteredEtpsByKind }));
    // }
    return this._elementToPracticeSvc.getFilteredElementsToPractice(
      this.selectedItems.length ? { type: this.selectedItems} : undefined).subscribe(
        (filteredEtpsByKind) => {
          // console.log({ filteredEtpsByKind })
          if (filteredEtpsByKind.length < 1) return this._nzNotificationSvc.warning('Without matches', 'There are not any elements to practice for this filters');
          // localStorage.setItem(localStorageLabels.customSelectedListOfETP, JSON.stringify(filteredEtpsByKind));
          this.setCustomList(filteredEtpsByKind);
          return this.navigate();
        }, 
        error => {
          console.log({ error });
          this._nzNotificationSvc.error('Something was wrong', 'We have just had an error, lets try again.');
          return this.navigate(true)
        }
    );

    // localStorage.setItem(
    //   localStorageLabels.selectedListOfKinds,
    //   JSON.stringify(this.selectedItems)
    // );
    // this._router.navigateByUrl(
    //   `/${RoutesApp.elementsToPractice}/${RoutesApp.test}`
    // );
  }
}
