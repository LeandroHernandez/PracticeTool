import { JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  IElementToPractice,
  IElementToPractice2,
  IEtp,
  IEtpItem,
  IEtpToCheck,
  IUse,
} from '../../interfaces';
import { ElementToPracticeService } from '../components/add-element-to-prectice/element-to-practice.service';
// import { AddElementToPrecticeComponent } from '../components/add-element-to-prectice/add-element-to-prectice.component';
import { Router, RouterLink } from '@angular/router';
import { localStorageLabels } from '../../constants';
import { FormComponent } from '../elements-to-practice/add-element-to-practice/form';
import { BehaviorSubject } from 'rxjs';
import {
  NzNotificationRef,
  NzNotificationService,
} from 'ng-zorro-antd/notification';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { MistakeComponent } from './mistake/mistake.component';
import { IMistake, IMistakenUse } from '../../interfaces/mistake.interface';

@Component({
  selector: 'app-test',
  // imports: [AddElementToPrecticeComponent],
  imports: [RouterLink, FormComponent, NzModalModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
})
export class TestComponent implements OnInit {
  public elementsToPractice: Array<IElementToPractice2> = [];
  public practiceList: Array<IEtp> = [];

  // public elementToPractice: IElementToPractice2 | null = null;

  // private elementToPractice = new BehaviorSubject<IElementToPractice2 | null>(
  //   null
  // );
  private elementToPractice = new BehaviorSubject<IEtpItem | null>(null);
  etp$ = this.elementToPractice.asObservable();

  constructor(
    private _router: Router,
    private _elementToPracticeSvc: ElementToPracticeService,
    private _nzNotificationSvc: NzNotificationService,
    private _nzModalSvc: NzModalService
  ) {}

  get url(): string {
    return this._router.url;
  }

  // get urlSections(): Array<string> {
  //   return this.url.split('/');
  // }

  get backTo(): string {
    const sections = this.url.split('/');

    if (sections.length > 1) {
      sections.pop();
      return sections.join('/');
    }

    return '';
  }

  ngOnInit(): void {
    // this.getElementsToPractice();
    this.testInit();
  }

  public testInit(): void {
    this.verifySelectedList();
    // this.getRandomETP();
  }

  public buildPracticeList(): Array<IEtp> {
    return (this.practiceList = this.elementsToPractice.map((etp) => {
      return { id: etp.id ?? '', etp, word: false, aplications: false };
    }));
  }

  public verifySelectedList(): void | Array<IElementToPractice2> {
    const selectedList: Array<IElementToPractice2> = JSON.parse(
      localStorage.getItem(localStorageLabels.selectedListOfETP) ?? '[]'
    );

    if (selectedList.length > 0) {
      // return (this.elementsToPractice = selectedList);
      this.elementsToPractice = selectedList;
      this.buildPracticeList();
      this.getRandomETP();
      return this.elementsToPractice;
    }

    return this.getElementsToPractice();
  }

  public getElementsToPractice(): void {
    this._elementToPracticeSvc
      .getElementsToPractice2()
      .subscribe((elementsToPractice) => {
        console.log({ elementsToPractice });
        this.elementsToPractice = elementsToPractice;
        this.buildPracticeList();
        this.getRandomETP();
        // console.log({ randomETP: this.elementToPractice });
      });
  }

  public getRandomETP(i?: number): void {
    // return this.elementToPractice.next( this.elementsToPractice[this.getRandomIndex()] ?? null);
    // const index = this.getRandomIndex();
    let index = this.getRandomIndex();
    if (i)
      while (index === i) {
        index = this.getRandomIndex();
      }
    // this.practiceList[this.getRandomIndex()] ?? null
    const content = this.practiceList[index];
    return this.elementToPractice.next({ content, index });
  }

  public getRandomIndex(): number {
    const min = 0;
    // const max = this.elementsToPractice.length - 1;
    const max = this.practiceList.length - 1;

    // let randomInteger = Math.floor(Math.random() * (max - min + 1)) + min;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public win(): Promise<boolean> {
    this._nzNotificationSvc.success(
      'You win',
      'Congratulations, you have completed succesfully the test.'
    );
    return this._router.navigateByUrl(this.backTo);
  }

  public mistake(mistakeList: Array<IMistake>, index: number): void {
    // mistakeList.forEach((mistake) => {
    //   console.log({ mistake });
    //   // console.log('Mistake');
    //   this._nzNotificationSvc.error('Mistake', `You have just made a mistake `);
    // });
    const modal: NzModalRef = this._nzModalSvc.create({
      // nzTitle: 'Test Confirmation',
      nzTitle: `You have just made ${
        mistakeList.length > 1 ? 'some mistakes' : 'a mistake'
      }`,
      nzContent: MistakeComponent,
      nzFooter: null,
    });

    console.log({ mistakeList });

    const instance = modal.getContentComponent();
    instance.mistakeList = mistakeList;

    // instance.valueFormEmitter.subscribe((value: any) => {
    //   console.log('Cambio en filtros:', value);
    //   this.filterAction.emit(value);
    // });

    this._nzNotificationSvc.error('Mistake', `You have just made a mistake `);
    return this.getRandomETP(index);
  }

  public useNormalize(use: IUse): IMistakenUse {
    const { name, meanings, verbInfo } = use;
    const body: any = {
      name,
      meanings: meanings.map((meaningItem) => meaningItem.toLowerCase()),
    };
    if (verbInfo) {
      const { irregular, simplePast, pastParticiple } = verbInfo;
      if (simplePast && pastParticiple)
        body.verbInfo = {
          irregular,
          simplePast: simplePast.toLowerCase(),
          pastParticiple: pastParticiple.toLowerCase(),
        };
    }
    return body;
  }

  public check(etpToCheck: IEtpToCheck): Array<IMistake> {
    const { etpItem, formValue } = etpToCheck;
    const mistakeList: Array<IMistake> = [];
    const { meanings, uses, en } = etpItem.content.etp;
    if (en.toLowerCase() !== formValue.en.toLowerCase())
      mistakeList.push({
        property: 'Basic form',
        input: formValue.en,
        right: en,
      });
    if (meanings) {
      const formMeanings: Array<string> = formValue.meanings.map(
        (item: string) => item.toLowerCase()
      );
      if (
        meanings.length !== formMeanings.length ||
        meanings.every((meaningItem) =>
          // formMeanings.find(
          //   (item) => item.toLowerCase() === meaningItem.toLowerCase()
          // )
          formMeanings.includes(meaningItem.toLowerCase())
        )
      )
        mistakeList.push({
          property: 'Meanings',
          input: formMeanings,
          right: meanings,
        });
    } else if (uses) {
      const formUses: Array<any> = formValue.uses;
      // if (
      //   formUses.length !== uses.length ||
      //   uses.some(
      //     (useItem) =>
      //       !formUses.find((item) => {
      //         const fItem: any = {
      //           meanings: item.meanings.map((meaningItem: string) =>
      //             meaningItem.toLowerCase()
      //           ),
      //         };
      //         if (item.verbInfo) {
      //           const verbInfo = item.verbInfo;
      //           fItem.verbInfo = {
      //             irregular: verbInfo.irregular,
      //             simplePast: verbInfo.simplePast.toLowerCase(),
      //             pastParticiple: verbInfo.pastParticiple.toLowerCase(),
      //           };
      //         }
      //         const uItem: any = {
      //           meanings: useItem.meanings.map((meaningItem: string) =>
      //             meaningItem.toLowerCase()
      //           ),
      //         };
      //         if (useItem.verbInfo) {
      //           const verbInfo = useItem.verbInfo;
      //           const { irregular, simplePast, pastParticiple } = verbInfo;
      //           uItem.verbInfo = {
      //             irregular: irregular,
      //             simplePast: simplePast ? simplePast.toLowerCase() : '',
      //             pastParticiple: pastParticiple
      //               ? pastParticiple.toLowerCase()
      //               : '',
      //           };
      //         }
      //         return fItem === uItem;
      //       })
      //   )
      // )
      //   mistakeList.push({ property: 'uses', input: formUses, right: uses });

      const usesList = uses.map((useItem) => this.useNormalize(useItem));
      const enteredUsesList = formUses.map((useItem) =>
        this.useNormalize(useItem)
      );

      if (
        usesList.length !== enteredUsesList.length ||
        usesList.every((useItem) => enteredUsesList.includes(useItem))
      )
        mistakeList.push({
          property: 'Uses',
          input: enteredUsesList,
          right: usesList,
        });
    }
    return mistakeList;
  }

  // public checkEtp(etpToCheck: IEtpToCheck): boolean {
  //   console.log({ etpToCheck });
  //   const { etpItem, formValue } = etpToCheck;
  //   return etpItem === formValue;
  // }

  // public submit(formValue: any): void {}
  public submit(etpToCheck: IEtpToCheck): Promise<boolean> | void {
    console.log({ etpToCheck });
    // const { id, word, aplications } = etpBody;
    const { etpItem, checkingWord, formValue } = etpToCheck;

    // const valid: boolean = this.checkEtp(etpToCheck);

    const etp = etpItem.content.etp;

    if (etp.id) delete etp.id;

    const { content, index } = etpItem;

    const mistakeList = this.check(etpToCheck);
    if (mistakeList.length > 0) return this.mistake(mistakeList, index);

    let { word, aplications } = content;

    checkingWord ? (word = true) : (aplications = true);

    if (word && aplications) this.practiceList.splice(index, 1);

    if (this.practiceList.length > 0) return this.getRandomETP(index);

    return this.win();
  }
}
