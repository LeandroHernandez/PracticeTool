import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IContentHeaderInfoItem, IType } from '../../../../../interfaces';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { TestConfirmationComponent } from '../test-confirmation/test-confirmation.component';
import { TestService } from '../../../pages/test';

@Component({
  selector: 'app-content-header',
  imports: [RouterLink],
  template: `
    <!-- <p>content-header works!</p> -->

    @if (contentHeaderInfo) {
    <div class="main_content">
      <button
        type="button"
        class="button-add"
        title="Add Word"
        [routerLink]="[contentHeaderInfo.add.route]"
        [title]="contentHeaderInfo.add.title"
      >
        {{ contentHeaderInfo.add.label }}
        <i class="bi bi-plus-lg"></i>
      </button>
      <h3 class="title">{{ contentHeaderInfo.title }}</h3>
      <!-- [routerLink]="[contentHeaderInfo.test.route]"  -->
      @if ( contentHeaderInfo.test ) {
      <button
        type="button"
        class="button-test"
        title="Test"
        (click)="goToTest()"
        [title]="contentHeaderInfo.test.title"
      >
        {{ contentHeaderInfo.test.label }}
        <i class="bi bi-play-fill"></i>
      </button>
      } @else {
      <div></div>
      }
    </div>
    }
  `,
  styles: [
    `
      .main_content {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 1.2rem;
        background-color: rgba(144, 147, 159, 0.1);
        padding: 1.2rem;
      }

      [class^='button'] {
        font-size: 1rem;
        padding: 0.3rem 0.7rem;
        border: none;
        border-radius: 0.3rem;
      }

      .title {
        font-size: 1.2rem;
      }

      .button-add {
        background-color: var(--secondary);
        color: var(--primary);

        .bi {
          margin-left: 0.4rem;
          &::before {
            transition: 0.2s ease;
            transition-property: transform, color;
          }
        }

        &:hover .bi::before {
          transform: scale(1.6);
          color: var(--accent);
        }
      }

      .button-test {
        border: 0.15rem solid var(--accent);
        background-color: var(--primary);
        color: var(--accent);
        font-weight: 500;

        transition: 0.2s ease;
        transition-property: transform, background-color, color;

        &:hover {
          transform: scale(1.1);
          background-color: var(--accent);
          color: var(--primary);
        }
      }
    `,
  ],
})
export class ContentHeaderComponent {
  @Input() contentHeaderInfo: IContentHeaderInfoItem | null = null;
  // @Input() types: Array<IType> = [];

  constructor(
    private _nzModalSvc: NzModalService,
    private _testSvc: TestService
  ) {}

  public goToTest(): void {
    console.log(' Showing test confirmation ');
    this._testSvc.setStatus(true);
    const modal: NzModalRef = this._nzModalSvc.create({
      // nzTitle: 'Test Confirmation',
      nzTitle: 'What kind of elements do you want to practice?',
      nzContent: TestConfirmationComponent,
      nzFooter: null,
    });

    const instance = modal.getContentComponent();
    if (this.contentHeaderInfo?.test?.practiceList)
      instance.practiceList = true;

    instance.closeEmitter.subscribe(() => modal.close());
  }
}
