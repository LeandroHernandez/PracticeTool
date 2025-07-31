import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { localStorageLabels, RoutesApp } from '../../../constants';

import {
  NzNotificationRef,
  NzNotificationService,
} from 'ng-zorro-antd/notification';
import {
  IElementToPractice,
  IElementToPractice2,
  IType,
} from '../../../interfaces';
import { ElementToPracticeService } from '../element-to-practice.service';
import { FormComponent } from './form';

@Component({
  selector: 'app-add-element-to-practice',
  imports: [FormComponent, RouterLink],
  templateUrl: './add-element-to-practice.component.html',
  styleUrl: './add-element-to-practice.component.css',
})
export class AddElementToPracticeComponent implements OnInit {
  public backTo: string = RoutesApp.elementsToPractice;

  public id: string | null = null;
  // public elementToPractice: IElementToPractice | any | null = null;

  constructor(
    // private _fb: FormBuilder,
    private _route: ActivatedRoute,
    private _elementToPracticeService: ElementToPracticeService,
    private _nzNotificationService: NzNotificationService
  ) {
    // this.form = this._fb.group({});
    // this.formInit();

    this.id = this._route.snapshot.paramMap.get('id');
    // this.id ? this.getElementToPractice(this.id) : false;
  }

  ngOnInit(): void {
    // this.getTypes();
    // this.form.get('selectedUses')?.valueChanges.subscribe((value) => {
    //   this.selectedUsesChange(value);
    // });
    // this.form.get('type')?.valueChanges.subscribe(() => {
    //   this.typeChange();
    // });
    // if (this.id) this.getElementToPractice(this.id);
  }

  public submit(
    elementToPractice: IElementToPractice2 | any
  ): Promise<void> | NzNotificationRef {
    if (!this.id) {
      return this._elementToPracticeService
        .addElementToPractice(elementToPractice)
        .then((reponse) => {
          console.log({ reponse });
          this._nzNotificationService.success(
            'Registered',
            'The element to practice was registered successfully'
          );
        })
        .catch((error) => console.log({ error }));
    }

    return this._elementToPracticeService
      .updateElementToPractice2(this.id, elementToPractice)
      .then((reponse) => {
        console.log({ reponse });
        const selectedList: Array<IElementToPractice2> = JSON.parse(localStorage.getItem(localStorageLabels.selectedListOfETP) ?? '[]');
        
        if ( selectedList.length > 0 ) {
          const selectedItemIndex: number = selectedList.findIndex(item => item.id === this.id);
          if (selectedItemIndex >= 0) {
            selectedList.splice(selectedItemIndex, 1, elementToPractice);
            localStorage.setItem(localStorageLabels.selectedListOfETP, JSON.stringify(selectedList));
          }
        }
        this._nzNotificationService.success(
          'Edited',
          'The element to practice was edited successfully'
        );
      })
      .catch((error) => console.log({ error }));
  }
}
