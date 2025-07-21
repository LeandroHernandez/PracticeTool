import { Component } from '@angular/core';
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
import { IElementToPractice2, IType } from '../../../interfaces';
import { TypeService } from '../../types/types.service';
import { localStorageLabels, RoutesApp } from '../../../constants';
import { Router } from '@angular/router';

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
  // @Input() types: Array<IType> = [];
  public types: Array<IType> = [];

  // public form: FormGroup;
  public selectedItems: Array<string> = [];
  readonly nodes: Array<any> = [];

  // constructor(private _fb: FormBuilder, private _typeSvc: TypeService) {
  constructor(private _router: Router, private _typeSvc: TypeService) {
    // this.form = this._fb.group({
    //   selectedItems: [[]],
    //   selectedETP: [true],
    // });
    // this.formInit();
    this.getTypes();
  }

  get selectedListOfETP(): Array<IElementToPractice2> {
    return JSON.parse(
      localStorage.getItem(localStorageLabels.selectedListOfETP) ?? '[]'
    );
  }

  // public formInit(): FormGroup {
  //   const group: FormGroup = this._fb.group({
  //     selectedItems: [[]],
  //     selectedETP: [true],
  //   });

  //   this.selectedListOfETP = JSON.parse(
  //     localStorage.getItem(localStorageLabels.selectedListOfETP) ?? '[]'
  //   );

  //   console.log({ selectedListOfETP: this.selectedListOfETP });

  //   if (this.selectedListOfETP.length < 1) group.removeControl('selectedETP');

  //   return (this.form = group);
  // }

  // public newControl(val?: any): FormControl {
  //   return new FormControl(val ?? '');
  // }

  public getTypes(): void {
    this._typeSvc.getTypes().subscribe(
      (types) => {
        this.types = types;
        console.log({ types });
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
    const nodes: Array<INode | void> = types
      .filter((item) => !item.father)
      .map((typeItem, i) => this.buildNode(typeItem, i));
    nodes.forEach((node) => this.nodes.push(node));
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

  // readonly nodes2 = [
  //   {
  //     title: 'Node1',
  //     value: '0-0',
  //     key: '0-0',
  //     children: [
  //       {
  //         title: 'Child Node1',
  //         value: '0-0-0',
  //         key: '0-0-0',
  //         isLeaf: true,
  //       },
  //     ],
  //   },
  //   {
  //     title: 'Node2',
  //     value: '0-1',
  //     key: '0-1',
  //     children: [
  //       {
  //         title: 'Child Node3',
  //         value: '0-1-0',
  //         key: '0-1-0',
  //         isLeaf: true,
  //       },
  //       {
  //         title: 'Child Node4',
  //         value: '0-1-1',
  //         key: '0-1-1',
  //         isLeaf: true,
  //       },
  //       {
  //         title: 'Child Node5',
  //         value: '0-1-2',
  //         key: '0-1-2',
  //         isLeaf: true,
  //       },
  //     ],
  //   },
  // ];

  public onChange($event: string[]): void {
    console.log($event);
  }

  public goToTest(): void {
    // this.nodes.forEach((node) => this.nodes2.push(node));
    console.log({
      nodes: this.nodes,
      // form: this.form,
    });

    localStorage.setItem(
      localStorageLabels.selectedListOfKinds,
      JSON.stringify(this.selectedItems)
    );
    this._router.navigateByUrl(
      `/${RoutesApp.elementsToPractice}/${RoutesApp.test}`
    );
  }
}
