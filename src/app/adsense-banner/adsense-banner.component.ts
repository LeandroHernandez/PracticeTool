import { AfterViewInit, Component, Input } from '@angular/core';

@Component({
  selector: 'app-adsense-banner',
  imports: [],
  templateUrl: './adsense-banner.component.html',
  styleUrl: './adsense-banner.component.css'
})
export class AdsenseBannerComponent implements AfterViewInit {
  @Input() adSlot!: string; // slot del anuncio que te da Google

  ngAfterViewInit() {
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (e) {
      console.error('Adsense error', e);
    }
  }

}
