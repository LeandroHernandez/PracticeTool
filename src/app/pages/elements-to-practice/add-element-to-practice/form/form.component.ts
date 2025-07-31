import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { RoutesApp, typesOfElementsToPractice, typesOfWords } from '../../../../constants';

import {
  NzNotificationRef,
  NzNotificationService,
} from 'ng-zorro-antd/notification';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { TypeService } from '../../../types/types.service';
import { Observable, Subscription } from 'rxjs';
import {
  IElementToPractice,
  IElementToPractice2,
  IEtp,
  IEtpItem,
  IEtpToCheck,
  IType,
  IUse,
} from '../../../../interfaces';
import { ElementToPracticeService } from '../../element-to-practice.service';
import { ActivatedRoute } from '@angular/router';
import { TestService } from '../../../test/test.service';

@Component({
  selector: 'app-form',
  imports: [
    ReactiveFormsModule,
    // RouterLink,
    NzSwitchModule,
    NzSelectModule,
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export class FormComponent implements OnInit {
  @Input() formLabel: string = 'Element to practice';
  @Input() elementToPractice: IElementToPractice | any = null;
  // @Input() etp$: Observable<IEtpItem | null> | null = null;

  @Output() formInfoEmitter: EventEmitter<IElementToPractice2> =
    new EventEmitter();
  @Output() etpEmitter: EventEmitter<IEtpToCheck> = new EventEmitter();

  public id: string | null = null;
  // public elementToPractice: IElementToPractice | any = null;

  public backTo: string = RoutesApp.elementsToPractice;
  public typesList: Array<any> = [];
  public usesList: Array<any> = [];

  public form: FormGroup;

  public verbId: string = typesOfWords.verb;

  // public etpItem: IEtpItem | null = null;
  public checkingWord = false;

  constructor(
    private _fb: FormBuilder,
    private _route: ActivatedRoute,
    private _testSvc: TestService,
    private _elementToPracticeService: ElementToPracticeService,
    private _typeService: TypeService,
    private _nzNotificationService: NzNotificationService
  ) {
    this.form = this._fb.group({
      en: ['', [Validators.required]],
      type: [typesOfElementsToPractice.word ?? '', [Validators.required]],
      selectedUses: [[], [Validators.required]],
      uses: this._fb.array([]),
      // ...(isWord ? {} : { meanings: this._fb.array([this.newMeaning()]) }),
    });
    if (!this.elementToPractice) {
      this.id = this._route.snapshot.paramMap.get('id');
      this.id ? this.getElementToPractice(this.id) : this.formInit();
    } else this.formInit(this.elementToPractice);
    
    this._testSvc.etp$.subscribe((etpItem) => {
      // console.log({ etpItem });
      if (!etpItem) return;
      // this.etpItem = etpItem;
      const { content } = etpItem;
      if (!content) return;
      this.formInit(content.etp, content);
      this.setSupscriptions();
    });

    this.setSupscriptions();
  }

  get etpItem(): IEtpItem | null {
    return this._testSvc.current;
  };

  get type(): FormControl {
    return this.form.get('type') as FormControl;
  }

  get grammarLesson(): boolean {
    return this.type.value === typesOfElementsToPractice.grammarLesson
      ? true
      : false;
  }

  get word(): boolean {
    return this.type.value === typesOfElementsToPractice.word ? true : false;
  }

  get uses(): FormArray {
    return this.form.get('uses') as FormArray;
  }

  get meanings(): FormArray {
    return this.form.get('meanings') as FormArray;
  }

  ngOnInit(): void {
    this.getTypes();

    // this.etpInit();
  }

  // public etpInit(): Subscription | void {
  //   if (!this._testSvc.current) return;

  //   return this._testSvc.etp$.subscribe((etpItem) => {
  //     // console.log({ etpItem });
  //     if (!etpItem) return;
  //     // this.etpItem = etpItem;
  //     const { content } = etpItem;
  //     if (!content) return;
  //     this.formInit(content.etp, content);
  //     this.setSupscriptions();
  //   });
  // }

  public setSupscriptions(): void {
    this.form.get('selectedUses')?.valueChanges.subscribe((value) => {
      if ( !this.form.get('uses') ) return;
      this.selectedUsesChange(
        value.map(
          (valId: string) =>
            this.usesList.find((useItem) => useItem.id === valId) ?? valId
        )
      );
    });

    this.form.get('type')?.valueChanges.subscribe((typeValue) => {
      this.typeChange(typeValue);
    });
  }

  public getElementToPractice(id: string): Subscription {
    return this._elementToPracticeService.getElementToPractice(id).subscribe(
      (elementToPractice) => {
        this.elementToPractice = elementToPractice;
        this.formInit(elementToPractice);
      },
      (error) => console.log({ error })
    );
  }

  public wordOrAplicationsTest(formBody: FormGroup, word: boolean): FormGroup {
    // word = false;
    this.checkingWord = word;
    const uses: FormArray | null = formBody.get('uses') as FormArray;
    const meanings: FormArray | null = formBody.get('meanings') as FormArray;
    formBody.disable();
    if (word) {
      // formBody.setControl('en', new FormControl(['', [Validators.required]]));
      formBody.get('en')?.patchValue('');
      formBody.get('en')?.enable();
      if (uses) {
        const useWithVerbInfoIndex: number = uses.controls.findIndex(
          (useItem) => useItem.get('verbInfo')
        );
        if (useWithVerbInfoIndex >= 0) {
          const useControl = uses.controls[useWithVerbInfoIndex] as FormGroup;
          const verbInfo = useControl.get('verbInfo') as FormGroup;
          // const { irregular, simplePast, pastParticiple } = verbInfo.controls;
          // irregular.patchValue(false);
          // simplePast.patchValue('');
          // pastParticiple.patchValue('');
          verbInfo.patchValue({
            irregular: false,
            simplePast: '',
            pastParticiple: '',
          });
          useControl.enable();
          useControl.get('meanings')?.disable();
          // useControl.setControl('verbInfo', verbInfo);
          // uses.controls[useWithVerbInfoIndex].setControl
          // formBody.get('verbInfo')?.enable();
        }
      }
    } else {
      if (uses) {
        formBody.get('uses')?.enable();
        uses.controls
          .find((useItem) => useItem.get('verbInfo'))
          ?.get('verbInfo')
          ?.disable();
        uses.controls.map((useItem) => {
          const group: FormGroup = useItem as FormGroup;
          group.setControl('meanings', this._fb.array([this.newMeaning()]));
          return group;
        });
      }
      if (meanings) {
        formBody.setControl('meanings', this._fb.array([this.newMeaning()]));
        formBody.get('meanings')?.enable();
      }
    }
    return formBody;
  }

  public formInit(body?: IElementToPractice2 | any, content?: IEtp): FormGroup {
    const isWord =
      this.form?.get('type')?.value === typesOfElementsToPractice.word;
    // const bodyForm: FormGroup = this._fb.group({
    let bodyForm: FormGroup = this._fb.group({
      en: ['', [Validators.required]],
      type: [typesOfElementsToPractice.word ?? '', [Validators.required]],
      selectedUses: [[], [Validators.required]],
      uses: this._fb.array([]),
      ...(isWord ? {} : { meanings: this._fb.array([this.newMeaning()]) }),
    });

    if (body) {
      if (body.meanings) {
        bodyForm.setControl(
          'meanings',
          this._fb.array(
            body.meanings.map((meaningVal: string) =>
              this.newMeaning(!content ? meaningVal : '')
            )
          )
        );
      } else bodyForm.removeControl('meanings');
      const selectedUses: Array<string> | null = body.selectedUses
        ? body.selectedUses.map((selectedUseItem: IType, j: number) => selectedUseItem.id ?? body.uses[j].id )
        : null;
        
      // content.etp.selectedUses?.map((selectedUseItem, j) => { const uses: Array<IUse> = content.etp.uses ?? []; console.log({ selectedUseItem, useItem: uses[j] }); return selectedUseItem ?? uses[j].id} );
      if (selectedUses) body.selectedUses = selectedUses;
      const { type } = body;
      bodyForm.patchValue({
        ...body,
        type: type.id ?? type,
      });

      if (body.uses)
        bodyForm.setControl(
          'uses',
          this._fb.array(
            body.uses.map((useItem: any) => {
              const group: FormGroup = this._fb.group({
                id: [useItem.id],
                name: [useItem.name],
                meanings: this._fb.array(
                  useItem.meanings.map((val: string) => this.newMeaning(val))
                ),
              });
              if (useItem.verbInfo) {
                const verbInfo = useItem.verbInfo;
                group.setControl(
                  'verbInfo',
                  this._fb.group({
                    irregular: [verbInfo.irregular ?? false],
                    simplePast: [verbInfo.simplePast ?? ''],
                    pastParticiple: [verbInfo.pastParticiple ?? ''],
                  })
                );
              }
              return group;
            })
          )
        );

      if (content) {
        const { word, aplications } = content;

        if (!word && !aplications) {
          // bodyForm = this.wordOrAplicationsTest(bodyForm, Math.floor(Math.random() * 2) === 0);
        }
        bodyForm = this.wordOrAplicationsTest(
          bodyForm,
          !word && !aplications
            ? Math.floor(Math.random() * 2) === 0
            : word
            ? false
            : true
        );
      }

      this.form = bodyForm;
    }
    this.form = bodyForm;
    this.setSupscriptions();
    
    // console.log({ body, formPostInit: this.form });

    return this.form;
  }

  public getTypes(): Subscription {
    return this._typeService.getTypes().subscribe(
      (types) => {
        this.typesList = [];
        this.usesList = [];
        types.forEach((type) => {
          if (!type.father) return this.typesList.push(type);
          return this.usesList.push(type);
        });
      },
      (error) => console.log({ error })
    );
  }

  public selectedUsesChange(selectedUses: Array<IType | any>): void {
    if (selectedUses.length === 0) this.uses.clear();
    this.uses.controls.forEach((useCurrentItem, i) => {
      if (!selectedUses.find((item) => item.id === useCurrentItem.value.id))
        this.uses.removeAt(i);
    });
    return selectedUses.forEach((useItem) => {
      if (
        this.uses.controls.find(
          (control) => control.get('id')?.value === useItem.id
        )
      )
        return;
      const group: FormGroup = this._fb.group({
        id: [useItem.id],
        name: [useItem.name],
        meanings: this._fb.array([this.newMeaning()]),
      });

      if (useItem.id === typesOfWords.verb) {
        const verbInfo: FormGroup = this._fb.group({
          irregular: [false],
          simplePast: [''],
          pastParticiple: [''],
        });
        group.setControl('verbInfo', verbInfo);
      }

      return this.uses.push(group);
    });
  }

  public typeChange(value: string): void {
    // if (!this.word)
    if (value !== typesOfElementsToPractice.word)
      return this.form.setControl(
        'meanings',
        this._fb.array([this.newMeaning()])
      );

    return this.form.removeControl('meanings');
  }

  public showMeaningActions(group: AbstractControl): boolean {
    return group.get('meanings')?.enabled ?? false;
  }

  public getMeanings(i: number): FormArray {
    return this.uses.controls[i].get('meanings') as FormArray;
  }

  public newMeaning(val?: string): FormControl {
    return new FormControl(val ?? '', [Validators.required]);
  }

  public addWordMeaning(i: number): void {
    this.getMeanings(i).push(this.newMeaning());
  }

  public removeWordMeaning(i: number, j: number): void {
    if (this.getMeanings(i).length < 2) return;

    return this.getMeanings(i).removeAt(j);
  }

  public addMeaning(): void {
    this.meanings.push(this.newMeaning());
  }

  public removeMeaning(i: number): void {
    // if (this.getMeanings(i).length < 2) return;

    return this.meanings.removeAt(i);
  }

  public invalidFormResponse(): NzNotificationRef {
    return this._nzNotificationService.warning(
      'Invalid Form',
      'El formulario no es valido, por favor rectifique los valores ingresados'
    );
  }

  // public setUses(): void {
  //   this.form.setControl('selectedUses', this.form.controls['selectedUses'] ?? new FormControl([], [Validators.required]));
  //   this.form.setControl('uses', this.form.controls['uses'] ?? new FormControl(this._fb.array([])));
  // }

  // public removeUses(): void {
  //   this.form.removeControl('selectedUses');
  //   this.form.removeControl('uses');
  // }

  public setUses(): void {
    if ( this.etpItem ) return;
    if (!this.form.get('selectedUses'))
      this.form.addControl(
        'selectedUses',
        new FormControl([], [Validators.required])
      );

    if (!this.form.get('uses'))
      this.form.addControl('uses', this._fb.array([]));

    // if (this.form.get('meanings')) this.form.removeControl('meanings');
  }

  public removeUses(): void {
    if ( this.etpItem ) return;
    if (this.form.get('selectedUses')) this.form.removeControl('selectedUses');

    if (this.form.get('uses')) this.form.removeControl('uses');

    if (!this.form.get('meanings'))
      this.form.setControl('meanings', this._fb.array([this.newMeaning()]));
  }

  public submit(): void | NzNotificationRef {
    console.log({ valid: this.form.valid, value: this.form.value });
    
    const meanings: Array<string> | null = this.form.get('meanings')?.value ?? null;

    // this.word ? this.setUses() : this.removeUses();
    const isWord =
      this.form.get('type')?.value === typesOfElementsToPractice.word;
    isWord ? this.setUses() : this.removeUses();

    if (!this.form.valid) {
      this.setUses();
      return this.invalidFormResponse();
    }

    let etpForm: FormGroup | null = null;
    if (this.etpItem) {
      etpForm = this.form;
      etpForm.enable();
    }

    const formBody = etpForm
      ? { ...etpForm.value }
      : {
          ...this.form.value,
        };
    
    if (meanings) formBody.meanings = meanings;

    // if (isWord && !this.etp$) {
    //   formBody.selectedUses = this.form.controls['selectedUses'].value.map(
    //     (selectedUseItem: IType | string) =>
    //       typeof selectedUseItem !== 'string'
    //         ? selectedUseItem
    //         : this.usesList.find(
    //             (useListItem) => useListItem.id === selectedUseItem
    //           ) ?? selectedUseItem
    //   );
    // }

    console.log({ etpItemToCheck: this.etpItem });
    if (this.etpItem) {
      const etpItem = {...this.etpItem};
      return this.etpEmitter.emit({
        etpItem,
        checkingWord: this.checkingWord,
        formValue: formBody,
      });
    }

    this.formInfoEmitter.emit(formBody);

    this.formInit(this.elementToPractice);
    this.setSupscriptions();
  }
}
