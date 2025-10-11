import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { localStorageLabels, RoutesApp } from '../../../../../enums';
import { IElementToPractice } from '../../../../../interfaces';

import { ElementToPracticeService } from '../element-to-practice.service';

import { FormComponent } from './form';

import {
  NzNotificationRef,
  NzNotificationService,
} from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-add-element-to-practice',
  imports: [FormComponent, RouterLink],
  templateUrl: './add-element-to-practice.component.html',
  styleUrl: './add-element-to-practice.component.css',
})
export class AddElementToPracticeComponent {
  public backTo: string = RoutesApp.elementsToPractice;

  public id: string | null = null;

  constructor(
    private _route: ActivatedRoute,
    private _elementToPracticeService: ElementToPracticeService,
    private _nzNotificationService: NzNotificationService
  ) {
    this.id = this._route.snapshot.paramMap.get('id');
  }

  public submit(
    elementToPractice: IElementToPractice | any
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
        const selectedList: Array<IElementToPractice> = JSON.parse(
          localStorage.getItem(localStorageLabels.etp.selectedList) ?? '[]'
        );

        if (selectedList.length > 0) {
          const selectedItemIndex: number = selectedList.findIndex(
            (item) => item.id === this.id
          );
          if (selectedItemIndex >= 0) {
            selectedList[selectedItemIndex] = {
              ...selectedList[selectedItemIndex],
              ...elementToPractice,
            };
            localStorage.setItem(
              localStorageLabels.etp.selectedList,
              JSON.stringify(selectedList)
            );
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
