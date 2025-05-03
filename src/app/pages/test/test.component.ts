import { JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IElementToPractice } from '../../interfaces';
import { ElementToPracticeService } from '../components/add-element-to-prectice/element-to-practice.service';
import { AddElementToPrecticeComponent } from '../components/add-element-to-prectice/add-element-to-prectice.component';

@Component({
  selector: 'app-test',
  imports: [AddElementToPrecticeComponent],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent implements OnInit {

  public elementsToPractice: Array<IElementToPractice> = [];

  constructor(private _elementToPracticeSvc: ElementToPracticeService) {}
  
  ngOnInit(): void {
    this.getElementsToPractice();
  }

  public getElementsToPractice(): void {
    this._elementToPracticeSvc.getElementsToPractice().subscribe(
      (elementsToPractice) => {
        console.log({ elementsToPractice })
        this.elementsToPractice = elementsToPractice;
      }
    )
  };

}
