import { DOCUMENT } from '@angular/common';
import { Component, ViewChild, ElementRef, Renderer2, AfterViewInit, inject, InjectionToken } from '@angular/core';

export const WINDOW = new InjectionToken<Window>('Window Token', {
  factory: () => window
});

@Component({
  selector: 'app-landing-page2',
  imports: [],
  templateUrl: './landing-page2.component.html',
  styleUrl: './landing-page2.component.css'
})
export class LandingPage2Component implements AfterViewInit {
  // @ViewChild('img') img!: ElementRef;
  // @ViewChild('section') section!: ElementRef;

  imgSrc = 'images/landing-page/frames/frame_00001.png';


  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  private window = inject(WINDOW);

  private removeListener!: () => void;
  private removeListener2!: () => void;


  ngAfterViewInit(): void {
    const MAX_FRAMES = 120;

    // const img = document.querySelector('img') as HTMLImageElement;

    // let maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const { scrollHeight } = this.document.documentElement;
    const { innerHeight } = this.window;
    let maxScroll = scrollHeight - innerHeight > 0 ? scrollHeight - innerHeight : 1;

    this.removeListener = this.renderer.listen(this.window, 'resize', () => {
      maxScroll = scrollHeight - innerHeight > 0 ? scrollHeight - innerHeight : 1;
    });
    // this.window.addEventListener('resize', () => {
    //   maxScroll = scrollHeight - innerHeight > 0 ? scrollHeight - innerHeight : 1;
    // });

    this.removeListener2 = this.renderer.listen(this.window, 'scroll', () => {

      const scrollPosition = this.window.scrollY;
      const scrollFraction = scrollPosition / maxScroll;
      const frameIndex = Math.floor(scrollFraction * MAX_FRAMES) + 1;
      const frameNumber = String(frameIndex <= MAX_FRAMES ? frameIndex : MAX_FRAMES).padStart(5, '0');
      // const imagePath = `images/landing-page/video/frame_${frameNumber}.webp`;
      const imagePath = `images/landing-page/frames/frame_${frameNumber}.png`;
      // const imagePath = `images/landing-page/transparent-frames/frame_${frameNumber}.png`;
      // img.src = imagePath;
      this.imgSrc = imagePath;
      // this.section.nativeElement.style.setProperty('--frame-url', `url(/${imagePath})`);
      console.log({ imagePath, frameIndex, scrollFraction, scrollPosition, maxScroll, scrollHeight, innerHeight });
    });
    //
    // this.window.addEventListener('scroll', () => {

    //   const scrollPosition = this.window.scrollY;
    //   const scrollFraction = scrollPosition / maxScroll;
    //   const frameIndex = Math.floor(scrollFraction * MAX_FRAMES) + 1;

    //   const frameNumber = String(frameIndex <= MAX_FRAMES ? frameIndex : MAX_FRAMES).padStart(5, '0');
    //   // const imagePath = `images/landing-page/video/frame_${frameNumber}.webp`;
    //   const imagePath = `images/landing-page/frames/frame_${frameNumber}.png`;

    //   // img.src = imagePath;
    //   this.imgSrc = imagePath;
    //   this.section.nativeElement.style.setProperty('--frame-url', `url(/${imagePath})`);

    //   console.log({ imagePath, frameIndex, scrollFraction, scrollPosition, maxScroll, scrollHeight, innerHeight });
    // });

  }

  ngOnDestroy() {
    this.removeListener();
    this.removeListener2();
  }

}
