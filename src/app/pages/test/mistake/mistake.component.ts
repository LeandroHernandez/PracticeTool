import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IMistake } from '../../../interfaces/mistake.interface';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-mistake',
  imports: [JsonPipe],
  templateUrl: './mistake.component.html',
  styleUrl: './mistake.component.css',
})
export class MistakeComponent {
  @Input() mistakeList: Array<IMistake> = [];

  @Output() confirmEmitter: EventEmitter<boolean> = new EventEmitter();

  public getEnteredAndCorrect(mistake: IMistake): Array<string | any> {
    return [ mistake.input, mistake.right ]
  }
}
