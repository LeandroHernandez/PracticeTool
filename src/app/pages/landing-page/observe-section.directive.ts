import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[appObserveSection]'
})
export class ObserveSectionDirective implements OnInit, OnDestroy {
  @Input() sectionId!: string;
  @Output() sectionInView = new EventEmitter<string>();

  private observer!: IntersectionObserver;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.sectionInView.emit(this.sectionId);
          }
        });
      },
      {
        threshold: 0.6, // 👈 mínimo 60% visible para "activar"
      }
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
