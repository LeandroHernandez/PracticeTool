import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IContentHeaderInfoItem, IType } from '../../../interfaces';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { TestConfirmationComponent } from '../test-confirmation/test-confirmation.component';

@Component({
  selector: 'app-content-header',
  imports: [RouterLink],
  templateUrl: './content-header.component.html',
  styleUrl: './content-header.component.css',
})
export class ContentHeaderComponent {
  @Input() contentHeaderInfo: IContentHeaderInfoItem | null = null;
  // @Input() types: Array<IType> = [];

  constructor(private _nzModalSvc: NzModalService) {}

  public goToTest(): void {
    const modal: NzModalRef = this._nzModalSvc.create({
      // nzTitle: 'Test Confirmation',
      nzTitle: 'What kind of elements do you want to practice?',
      nzContent: TestConfirmationComponent,
      nzFooter: null,
    });

    const instance = modal.getContentComponent();
    // instance.types = this.types;

    // instance.valueFormEmitter.subscribe((value: any) => {
    //   console.log('Cambio en filtros:', value);
    //   this.filterAction.emit(value);
    // });
  }
}
