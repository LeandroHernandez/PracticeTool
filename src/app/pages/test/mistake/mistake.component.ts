import { Component, Input } from '@angular/core';
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
}
