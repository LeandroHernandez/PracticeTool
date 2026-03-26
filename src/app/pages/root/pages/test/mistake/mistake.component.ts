import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IMistake } from '../../../../../interfaces/mistake.interface';
import { JsonPipe } from '@angular/common';
import { localStorageLabels } from '../../../../../enums';

@Component({
  selector: 'app-mistake',
  imports: [JsonPipe],
  templateUrl: './mistake.component.html',
  styleUrl: './mistake.component.css',
})
export class MistakeComponent {
  @Input() mistakeList: Array<IMistake> = [];
  @Input() gifs: Array<string> = [];
  @Input() correctNumber: number = 0;

  @Output() confirmEmitter: EventEmitter<boolean> = new EventEmitter();

  get en(): boolean {
    return localStorage.getItem(localStorageLabels.localCurrentLanguage) === 'en';
  }

  public getEnteredAndCorrect(mistake: IMistake): Array<string | any> {
    return [mistake.input, mistake.right]
  }
}
