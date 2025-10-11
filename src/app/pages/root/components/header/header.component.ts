import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { RoutesApp } from '../../../../enums';

import { AuthService } from '../../../auth/auth.service';

import {
  NzNotificationRef,
  NzNotificationService,
} from 'ng-zorro-antd/notification';
import { NzPopoverModule } from 'ng-zorro-antd/popover';

@Component({
  selector: 'app-header',
  imports: [RouterLink, NzPopoverModule],
  // templateUrl: './header.component.html',
  template: `
    <!-- <p>header works!</p> -->

    <div class="container_div">
      <button
        type="button"
        class="button-menu"
        title="Menu"
        (click)="changeMenu.emit(true)"
      >
        <i class="bi bi-list"></i>
      </button>

      <h1>Practice Tool</h1>

      <!-- nzPopoverTitle="Title"
      [(nzPopoverVisible)]="visible"
      (nzPopoverVisibleChange)="change($event)" -->
      <button
        type="button"
        class="button-options"
        title="options"
        nz-popover
        nzPopoverTrigger="click"
        [nzPopoverContent]="menu"
      >
        <i class="bi bi-gear"></i>
      </button>
      <ng-template #menu>
        <ul nz-menu class="ul-options">
          <li nz-menu-item [routerLink]="profileRoute">Profile</li>
          <li nz-menu-item>
            <button
              type="button"
              class="button-log-out"
              data-bs-toggle="button"
              title="Log out"
              nz-popover
              nzPopoverTitle="Log out"
              nzPopoverTrigger="click"
              [nzPopoverContent]="contentTemplate"
            >
              Log Out
            </button>
            <ng-template #contentTemplate>
              <a (click)="logOut()">Sure?</a>
            </ng-template>
          </li>
        </ul>
      </ng-template>
      <!-- <nz-dropdown-menu #menu="nzDropdownMenu">
        <ul nz-menu class="ul-options">
          <li nz-menu-item [routerLink]="profileRoute">Profile</li>
          <li nz-menu-item>
            <button
              type="button"
              class="button-log-out"
              data-bs-toggle="button"
              title="Log out"
              nz-popover
              nzPopoverTitle="Log out"
              nzPopoverTrigger="click"
              [nzPopoverContent]="contentTemplate"
            >
              Log Out
            </button>
            <ng-template #contentTemplate>
              <a (click)="logOut()">Sure?</a>
            </ng-template>
          </li>
        </ul>
      </nz-dropdown-menu> -->
    </div>
  `,
  // styleUrl: './header.component.css'
  styles: [
    `
      .container_div {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        max-width: 100vw;
        padding: 1.2rem;
        gap: 1.2rem;
        border-radius: 0.3rem;
        border-bottom: 0.1rem solid var(--secondary);
        background-color: var(--primary);
      }

      [class^='button'],
      ::ng-deep .ant-dropdown-trigger {
        outline: none;
        cursor: pointer;
        border-radius: 10px;
        padding: 0.3rem 0.6rem;
        color: var(--accent);
        border: 0.1rem solid var(--accent);

        .bi-list::before {
          transition: 0.1s transform ease;
        }

        &:hover {
          color: var(--primary);
          background-color: var(--accent);

          .bi-list::before {
            transform: scale(1.5);
          }
        }
      }

      ::ng-deep .ant-dropdown-menu-item {
        padding: 1rem;
      }

      .button-options {
        border: none;
        color: var(--primary);
        background-color: var(--secondary);

        transition: 0.2s ease;
        transition-property: transform, background-color;

        .bi-gear::before {
          color: var(--primary);

          transition: 0.2s transform ease;
        }

        &:hover {
          transform: scale(1.1);
          background-color: var(--accent);

          .bi-gear::before {
            transform: scale(1.3);
          }
        }
      }

      .button-log-out {
        color: var(--secondary);
        background-color: transparent;
      }

      h1 {
        font-size: clamp(1rem, 3vw, 2rem);
      }
    `,
  ],
})
export class HeaderComponent {
  @Output() changeMenu: EventEmitter<boolean> = new EventEmitter();

  public profileRoute: string = `/${RoutesApp.profile}`;

  constructor(
    private _router: Router,
    private _authSvc: AuthService,
    private _nzNotificationSvc: NzNotificationService
  ) {}

  public error(errorResponse: any): NzNotificationRef {
    console.log({ errorResponse });

    return this._nzNotificationSvc.error(
      'error',
      'Something went wrong, please try again.'
    );
  }

  public logOut(): Promise<boolean | NzNotificationRef> {
    return this._authSvc
      .logOut()
      .then(() => {
        this._nzNotificationSvc.success('Log out', 'Come back soon.');
        return this._router.navigateByUrl(`/${RoutesApp.landingPage}`);
      })
      .catch((error) => this.error(error));
  }
}
