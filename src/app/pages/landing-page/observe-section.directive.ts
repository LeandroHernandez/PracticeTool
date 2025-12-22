import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';

@Directive({
    selector: '[appObserveSection]'
})
export class ObserveSectionDirective implements OnInit, OnDestroy {
    @Input() thresholdDesktop = 0.6;
    @Input() thresholdMobile = 0.5;

    @Input() sectionId!: string;
    @Output() sectionInView = new EventEmitter<string>();

    private observer!: IntersectionObserver;
    private sub!: Subscription;

    constructor(
        private el: ElementRef,
        private breakpointObserver: BreakpointObserver
    ) { }

    ngOnInit() {
        // Observar breakpoints con Angular CDK
        this.sub = this.breakpointObserver
            .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium])
            .subscribe((state) => {
                const isSmall = state.breakpoints[Breakpoints.XSmall] || state.breakpoints[Breakpoints.Small];
                this.recreateObserver(isSmall ? 0.5 : 0.6);
            });
    }

    private createObserver(threshold: number) {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        this.sectionInView.emit(this.sectionId);
                    }
                });
            },
            { threshold }
        );

        this.observer.observe(this.el.nativeElement);
    }

    private recreateObserver(threshold: number) {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.createObserver(threshold);
    }

    ngOnDestroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        if (this.sub) {
            this.sub.unsubscribe();
        }
    }
}