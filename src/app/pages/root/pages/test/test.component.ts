import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { localStorageLabels } from '../../../../enums';
import {
  IElementToPractice,
  IEtp,
  IEtpItem,
  IEtpToCheck,
  IUse,
  IVerbInfo,
  IMistake,
  IMistakenUse,
  IUser,
  ETestReference,
} from '../../../../interfaces';

import { ElementToPracticeService } from '../elements-to-practice/element-to-practice.service';
import { TestService } from './test.service';

import { FormComponent } from '../elements-to-practice/add-element-to-practice/form';
import { MistakeComponent } from './mistake/mistake.component';

import {
  NzNotificationRef,
  NzNotificationService,
} from 'ng-zorro-antd/notification';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { RootService } from '../../root.service';
import { Subscription } from 'rxjs';
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

  public win(): void {
    return this._rootSvc.user$.subscribe((userInfo: IUser) => {
      if (!userInfo) return;
      // const date = Date.now();
      const date = DateTime.now().toISO();
      const body = {
        author: userInfo.id,
        etps: this.elementsToPractice,
        reference: ETestReference[this.url.split('/').includes('practice-lists') ? 'practiceLists' : 'etps'],
        createdAt: date,
        lastUpdate: date,
        state: true
      }
      // console.log({ body });
      this._testSvc.addTest(body).then(() => {
        // console.log('You win');
        this._nzNotificationSvc.success(
          'You win',
          'Congratulations, you have completed succesfully the test.'
        );
        return this._router.navigateByUrl(this.backTo);
      }).catch(error => console.error({ error }))
    }, error => console.error({ error })).unsubscribe();
  }

  public mistake(mistakeList: Array<IMistake>, index: number): void {
    this._testSvc.reset();
    this.buildPracticeList();
    const modal: NzModalRef = this._nzModalSvc.create({
      nzTitle: `You have just made ${mistakeList.length > 1 ? 'some mistakes' : 'a mistake'
        }`,
      nzContent: MistakeComponent,
      nzFooter: null,
      nzWidth: '90vw'
    });

    // console.log({ mistakeList });

    const instance = modal.getContentComponent();
    instance.mistakeList = mistakeList;

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
    // console.log({ etpToCheck });
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

      // console.log({ usesList, enteredUsesList })

      // !usesList.every((useItem) => {
      //   const someCodition = enteredUsesList.some((enteredItem) => {
      //     let subCondition =
      //       useItem.name === enteredItem.name &&
      //       useItem.meanings.every((useMeaning) =>
      //         enteredItem.meanings.includes(useMeaning)
      //       );
      //     let subCondition2 = true;
      //     if (useItem.verbInfo) {
      //       const useVerbIndo: IVerbInfo = useItem.verbInfo;
      //       const enterdeVerbInfo: IVerbInfo | undefined =
      //         enteredItem.verbInfo;
      //       subCondition2 = !enterdeVerbInfo
      //         ? false
      //         : useVerbIndo.irregular === enterdeVerbInfo.irregular &&
      //         useVerbIndo.simplePast === enterdeVerbInfo.simplePast &&
      //         useVerbIndo.pastParticiple === enterdeVerbInfo.pastParticiple;
      //     }
      //     return subCondition && subCondition2;
      //   });
      //   return someCodition;
      // })
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
              // delete usesList[i].verbInfo;
              // delete enteredUsesList[vIndex].verbInfo;
            }
          }

          const mIndex = enteredUsesList.findIndex(eUse => name === eUse.name &&
            meanings.every((useMeaning) =>
              eUse.meanings.includes(useMeaning)
            )
          )

          if (!usesList[i].verbInfo && mIndex >= 0) {
            // usesList.splice(i, 1);
            // enteredUsesList.splice(mIndex, 1);
            usesNames.push(name);
          }
        })

        // console.log({ usesList, enteredUsesList });

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

        // console.log({ usesNames });
      }
    }
    // console.log({ mistakeList });
    return mistakeList;
  }
  public submit(etpToCheck: IEtpToCheck): void {
    const { etpItem, checkingWord, formValue } = etpToCheck;

    const { content, index } = etpItem;

    const mistakeList = this.check(etpToCheck);
    if (mistakeList.length > 0) return this.mistake(mistakeList, index);

    // console.log('Without mistakes');

    let { word, aplications } = content;

    checkingWord ? (word = true) : (aplications = true);

    if (word) this.practiceList[index].word = word;
    if (aplications) this.practiceList[index].aplications = aplications;

    if (word && aplications) this.practiceList.splice(index, 1);

    if (this.practiceList.length > 0) return this.getRandomETP(index);

    return this.win();
  }

  ngOnDestroy(): void {
    this._testSvc.reset();
    this._testSvc.setStatus(false);
  }
}
