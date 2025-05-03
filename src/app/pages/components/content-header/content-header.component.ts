import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IContentHeaderInfoItem } from '../../../interfaces';

@Component({
  selector: 'app-content-header',
  imports: [RouterLink],
  templateUrl: './content-header.component.html',
  styleUrl: './content-header.component.css'
})
export class ContentHeaderComponent {
  @Input() contentHeaderInfo: IContentHeaderInfoItem | null = null;
}
