import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-features',
  imports: [],
  templateUrl: './features.component.html',
  styleUrl: './features.component.css',
  encapsulation: ViewEncapsulation.None
})
export class FeaturesComponent {
  @Input() currentLanguage: string = 'en';

}