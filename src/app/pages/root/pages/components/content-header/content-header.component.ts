import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IContentHeaderInfoItem, IType } from '../../../../../interfaces';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { TestConfirmationComponent } from '../test-confirmation/test-confirmation.component';
import { TestService } from '../../../pages/test';
import { RootService } from '../../../root.service';
import { localStorageLabels, RoleIds } from '../../../../../enums';

@Component({
  selector: 'app-content-header',
  imports: [RouterLink],
  template: `
    <!-- <p>content-header works!</p> -->

    @if (contentHeaderInfo) {
    <div class="main_content">
      <button
        type="button"
        [class]="!addEditAction ? 'button-add disabled' : 'button-add' "
        title="Add Word"
        [routerLink]="[contentHeaderInfo.add.route]"
        [title]="contentHeaderInfo.add.title"
        [disabled]="!addEditAction"
      >
        {{ contentHeaderInfo.add.label }}
        <i class="bi bi-plus-lg"></i>
      </button>
      <h3 class="title">{{ contentHeaderInfo.title }}</h3>
      <!-- [routerLink]="[contentHeaderInfo.test.route]"  -->
      @if ( contentHeaderInfo.test ) {
      <button
        type="button"
        class="button-test header-test-button"
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

      [class="button-add disabled"] {
        position: relative;
        cursor: not-allowed;
        transition: none;

        &:hover {
          transform: none;

          .bi::before {
            transition: none;
            transform: none;
            color: var(--primary);
          }
        }

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          background-color: var(--primary);
          opacity: .3 
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

  public addEditAction: boolean = true;
  public availableToAdd: RoleIds[] = [RoleIds.admin];

  get en(): boolean {
    return localStorage.getItem(localStorageLabels.localCurrentLanguage) === 'en';
  }

  constructor(
    private _nzModalSvc: NzModalService,
    private _testSvc: TestService,
    private _rootSvc: RootService,
  ) { }

  ngOnInit(): void {
    this.getUserInfo();
  }

  public getUserInfo(): void {
    this._rootSvc.user$.subscribe(
      userInfo => {
        if (!userInfo) return;
        const { role } = userInfo;
        if (!role) return;
        if (!this.availableToAdd.includes(role)) this.addEditAction = false;
      }
    )
  }

  public goToTest(): void {
    // console.log(' Showing test confirmation ');
    this._testSvc.setStatus(true);
    const modal: NzModalRef = this._nzModalSvc.create({
      // nzTitle: 'Test Confirmation',
      nzTitle: this.en ? 'Test conformation' : 'Confirmación de test',
      nzContent: TestConfirmationComponent,
      nzFooter: null,
      nzWidth: '90vw'
    });

    const instance = modal.getContentComponent();
    if (this.contentHeaderInfo?.test?.practiceList)
      instance.practiceList = true;

    instance.closeEmitter.subscribe(() => modal.close());
  }
}
