import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { localStorageLabels } from '../../../../enums';
import {
  IElementToPractice,
  IEtp,
  IEtpToCheck,
  IUse,
  IMistake,
  IMistakenUse,
  IUser,
  ETestReference,
  TEtpTestItem,
  TEtpTI,
  TTestBody,
} from '../../../../interfaces';

import { ElementToPracticeService } from '../elements-to-practice/element-to-practice.service';
import { TestService } from './test.service';

import { FormComponent } from '../elements-to-practice/add-element-to-practice/form';
import { MistakeComponent } from './mistake/mistake.component';

import {
  NzNotificationService,
} from 'ng-zorro-antd/notification';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { RootService } from '../../root.service';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-test',
  imports: [FormComponent, NzModalModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
})
export class TestComponent implements OnInit, OnDestroy {
  public elementsToPractice: Array<IElementToPractice> = [];
  public practiceList: Array<IEtp> = [];
  public correctNumber: number = 0;
  public correctTotal: number = 0;

  public id: string | null = null;
  public author: string = '';
  public etps: Array<TEtpTestItem> = [];
  public mistakes: Array<TEtpTI> = [];
  public correctOnes: Array<TEtpTI> = [];

  public date = DateTime.now().toISO();

  public gifs: any = [];

  constructor(
    private _router: Router,
    private _rootSvc: RootService,
    private _elementToPracticeSvc: ElementToPracticeService,
    private _testSvc: TestService,
    private _nzNotificationSvc: NzNotificationService,
    private _nzModalSvc: NzModalService
  ) { }

  get url(): string {
    return this._router.url;
  }

  get backTo(): string {
    const sections = this.url.split('/');

    if (sections.length > 1) {
      sections.pop();
      return sections.join('/');
    }

    return '';
  }

  get en(): boolean {
    return localStorage.getItem(localStorageLabels.localCurrentLanguage) === 'en';
  }

  get formLabel(): string {
    return this.en ? 'Element to practice' : 'Elemento a practicar';
  }

  ngOnInit(): void {
    this.testInit();
  }

  public backToAction(): Promise<boolean> {
    this._testSvc.reset();
    return this._router.navigate([this.backTo]);
  }

  public testInit(): void {
    this.verifySelectedList();
  }

  public buildPracticeList(): Array<IEtp> {
    return (this.practiceList = this.elementsToPractice.map((etp) => {
      return { id: etp.id ?? '', etp, word: false, aplications: false };
    }));
  }

  public verifySelectedList(): void | Array<IElementToPractice> {
    const selectedList: Array<IElementToPractice> = JSON.parse(
      localStorage.getItem(localStorageLabels.etp.customSelectedList) ?? '[]'
    );

    if (selectedList.length > 0) {
      this.elementsToPractice = selectedList;
      this.buildPracticeList();
      this.getRandomETP();
      return this.elementsToPractice;
    }

    return this.getElementsToPractice();
  }

  public getElementsToPractice(): void {
    this._elementToPracticeSvc
      .getFilteredElementsToPractice()
      .subscribe((elementsToPractice) => {
        this.elementsToPractice = elementsToPractice;
        this.etps = this.elementsToPractice.map((etp) => { const { id, en } = etp; return { id: id ?? '', en } });
        this.buildPracticeList();
        this.getRandomETP();
      });
  }

  public getRandomETP(i?: number): void {
    let index = this.getRandomIndex(i);
    const content = this.practiceList[index];

    return this._testSvc.setEtp({ content, index });
  }

  public getRandomIndex(i?: number): number {
    const length = this.practiceList.length;
    const min = 0;
    const max = length - 1;

    let index = 0;

    do {
      index = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (index === i && length > 1);

    return index;
  }

  public win(): Promise<boolean> {
    // return this._rootSvc.user$.subscribe((userInfo: IUser) => {
    //   if (!userInfo) return;
    //   const date = DateTime.now().toISO();
    //   const body = {
    //     author: userInfo.id,
    //     etps: this.elementsToPractice,
    //     reference: ETestReference[this.url.split('/').includes('practice-lists') ? 'practiceLists' : 'etps'],
    //     createdAt: date,
    //     lastUpdate: date,
    //     state: true
    //   }
    //   this._testSvc.addTest(body).then(() => {
    //     this._nzNotificationSvc.success(
    //       'You win',
    //       'Congratulations, you have completed succesfully the test.'
    //     );
    //     return this._router.navigateByUrl(this.backTo);
    //   }).catch(error => console.error({ error }))
    // }, error => console.error({ error })).unsubscribe();
    this._nzNotificationSvc.success(
      'You win',
      'Congratulations, you have completed succesfully the test.'
    );
    return this._router.navigateByUrl(this.backTo);
  }

  public mistake(mistakeList: Array<IMistake>, index: number, gifs: string[]): void {
    this._testSvc.reset();
    this.buildPracticeList();
    const modal: NzModalRef = this._nzModalSvc.create({
      nzTitle: `You have just made ${mistakeList.length > 1 ? 'some mistakes' : 'a mistake'
        }`,
      nzContent: MistakeComponent,
      nzFooter: null,
      nzWidth: '90vw'
    });

    const instance = modal.getContentComponent();
    instance.gifs = gifs;
    instance.mistakeList = mistakeList;
    instance.correctNumber = this.correctNumber;

    this.correctNumber = 0;

    instance.confirmEmitter.subscribe(() => modal.close());

    modal.afterClose.subscribe(() => this.getRandomETP(index));

    this._nzNotificationSvc.error('Mistake', `You have just made a mistake `);
    return;
  }

  public useNormalize(use: IUse): IMistakenUse {
    const { name, meanings, verbInfo } = use;
    const body: any = {
      name,
      meanings: meanings?.map((meaningItem) => meaningItem.toLowerCase()),
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
        !meanings.every((meaningItem) =>
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

      const usesList = uses.map((useItem) => this.useNormalize(useItem));
      const enteredUsesList = formUses.map((useItem) =>
        this.useNormalize(useItem)
      );

      if (usesList.length !== enteredUsesList.length) {
        mistakeList.push({
          property: 'Uses',
          input: enteredUsesList,
          right: usesList,
        })
      } else {
        const usesNames: string[] = [];
        usesList.forEach((use, i) => {
          const { name, meanings, verbInfo } = use;

          if (verbInfo) {
            const vIndex = enteredUsesList.findIndex(
              eUse => eUse.verbInfo &&
                verbInfo.irregular === eUse.verbInfo.irregular &&
                verbInfo.simplePast === eUse.verbInfo.simplePast &&
                verbInfo.pastParticiple === eUse.verbInfo.pastParticiple
            )

            if (vIndex >= 0) {
              usesList[i] = { name, meanings };
              enteredUsesList[vIndex] = { name: enteredUsesList[vIndex].name, meanings: enteredUsesList[vIndex].meanings, }
            }
          }

          const mIndex = enteredUsesList.findIndex(eUse => name === eUse.name &&
            meanings.every((useMeaning) =>
              eUse.meanings.includes(useMeaning)
            )
          )

          if (!usesList[i].verbInfo && mIndex >= 0) {
            usesNames.push(name);
          }
        })

        usesNames.forEach(useName => {
          usesList.splice(usesList.findIndex(item => item.name === useName), 1);
          enteredUsesList.splice(enteredUsesList.findIndex(item => item.name === useName), 1);
        })

        if (usesList.length > 0 || enteredUsesList.length > 0) {
          mistakeList.push({
            property: 'Uses',
            input: enteredUsesList,
            right: usesList,
          })

        }
      }
    }
    return mistakeList;
  }

  public registerEditTest(body: Partial<TTestBody>): void {
    if (!this.id) {
      this._testSvc.addTest(body).then((newId) => {
        console.log({ newId });
        this.id = newId;
      });
    } else {
      this._testSvc.updateTest(this.id, body).then(() => console.log('Test updated')).catch(error => console.error({ error }));
    }
  }


  public submit(etpToCheck: IEtpToCheck): Promise<boolean> | void {
    const { etpItem, checkingWord } = etpToCheck;

    const { content, index } = etpItem;

    const testBody: Partial<TTestBody> = {
      author: this.author,
      etps: this.etps,
      // mistakes: this.mistakes,
      correctOnes: this.correctOnes,
      reference: ETestReference[this.url.split('/').includes('practice-lists') ? 'practiceLists' : 'etps'],
      completedPercentage: this.correctTotal === this.etps.length ? 100 : Math.round((this.correctTotal * 100) / this.etps.length),
      createdAt: this.date,
      lastUpdate: this.date,
      state: true,
    }

    const { id, en } = content.etp;
    const mistakeList = this.check(etpToCheck);
    if (mistakeList.length > 0) {
      const existingIndex = this.mistakes.findIndex(item => item.id === id);
      if (existingIndex < 0) {
        this.mistakes.push({ id, en, number: 0 });
      } else this.mistakes[existingIndex] = { id, en, number: this.mistakes[existingIndex].number + 1 };
      const body: Partial<TTestBody> = {
        ...testBody,
        mistakes: this.mistakes,
        // correctOnes: this.correctOnes,
      }
      this.registerEditTest(body);
      return this.mistake(mistakeList, index, etpItem.content.etp.gifs ?? []);
    }

    let { word, aplications } = content;

    checkingWord ? (word = true) : (aplications = true);

    if (word) this.practiceList[index].word = word;
    if (aplications) this.practiceList[index].aplications = aplications;

    if (word && aplications) this.practiceList.splice(index, 1);

    this.correctNumber++;
    if (this.correctNumber > this.correctTotal) this.correctTotal++;

    const existingIndex = this.correctOnes.findIndex(item => item.id === id);
    if (existingIndex < 0) {
      this.correctOnes.push({ id, en, number: 0 });
    } else this.correctOnes[existingIndex] = { id, en, number: this.correctOnes[existingIndex].number + 1 };

    const body: Partial<TTestBody> = {
      ...testBody,
      mistakes: this.mistakes,
      correctOnes: this.correctOnes,
      completedPercentage: this.correctTotal === this.etps.length ? 100 : Math.round((this.correctTotal * 100) / this.etps.length),
    }
    this.registerEditTest(body);

    if (this.practiceList.length > 0) return this.getRandomETP(index);

    return this.win();
  }

  ngOnDestroy(): void {
    this._testSvc.reset();
    this._testSvc.setStatus(false);
  }
}
