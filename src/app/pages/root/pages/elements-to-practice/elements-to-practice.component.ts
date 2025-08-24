import { Component, OnInit } from '@angular/core';
// import { WordService } from './words.service';
import { ITableItem } from '../../../../interfaces/table-item.interface';
import { localStorageLabels, RoutesApp } from '../../../../constants';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  IContentHeaderInfoItem,
  IElementToPractice,
  IElementToPractice2,
  IPageTableInfo,
  IType,
} from '../../../../interfaces';
import { IFilterFormField } from '../../../../interfaces/filter-form-field.interface';
import { TypeService } from '../types/types.service';
import { ElementToPracticeService } from './element-to-practice.service';
import { TestService } from '../test/test.service';
import { PracticeListsService } from '../practice-lists/practice-lists.service';
import { ContentHeaderComponent } from '../components/content-header/content-header.component';
import { TableComponent } from '../components/table/table.component';

@Component({
  selector: 'app-elements-to-practice',
  imports: [RouterOutlet],
  templateUrl: './elements-to-practice.component.html',
  styleUrl: './elements-to-practice.component.css',
})
export class ElementsToPracticeComponent {}
