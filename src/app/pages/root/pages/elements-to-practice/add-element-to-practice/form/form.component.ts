import { Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  localStorageLabels,
  RoutesApp,
  typesOfElementsToPractice,
  typesOfWords,
} from '../../../../../../enums';

import {
  NzNotificationRef,
  NzNotificationService,
} from 'ng-zorro-antd/notification';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { TypeService } from '../../../types/types.service';
import { Subscription } from 'rxjs';
import {
  IElementToPractice,
  IEtp,
  IEtpItem,
  IEtpToCheck,
  IType,
} from '../../../../../../interfaces';
import { ElementToPracticeService } from '../../element-to-practice.service';
import { ActivatedRoute } from '@angular/router';
import { TestService } from '../../../test/test.service';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { giphyItem } from '../../../../../../interfaces/giphy.interfaces';
import { GifService } from '../../../../gif.service';
import { WindowService } from '../../../../window.service';
import stringSimilarity from 'string-similarity';
import { DecimalPipe } from '@angular/common';

interface IEnEs {
  en: string;
  es: string;
}

interface IPronunciation {
  score: number;
  label: IEnEs | null
}

@Component({
  selector: 'app-form',
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    NzSwitchModule,
    NzSelectModule,
    NzPopoverModule
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export class FormComponent implements OnInit {
  @Input() formLabel: string = 'Element to practice';
  @Input() elementToPractice: IElementToPractice | any = null;
  // @Input() etp$: Observable<IEtpItem | null> | null = null;

  @Output() formInfoEmitter: EventEmitter<IElementToPractice> =
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

  public showErrors: boolean = false;

  public show: boolean = false;
  public gif: giphyItem | null = null;
  public gifsToShow: giphyItem[] = [];

  public enPronListening: boolean = false;

  get language(): string {
    const res: string = localStorage.getItem(localStorageLabels.localCurrentLanguage) ?? 'en';
    return res;
  }

  get etpItem(): IEtpItem | null {
    return this._testSvc.current;
  }

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

  get examples(): FormArray {
    return this.form.get('examples') as FormArray;
  }

  get gifs(): FormArray {
    return this.form.get('gifs') as FormArray;
  }

  get verbInfo(): FormGroup {
    return this.form.get('verbInfo') as FormGroup;
  }

  // get enPron(): IPronunciation | null {
  //   // return this.pronunciations.find(item => item.key === 'en') ?? null;
  //   return JSON.parse(localStorage.getItem('enPron') ?? 'null');
  // }

  constructor(
    private _fb: FormBuilder,
    private _route: ActivatedRoute,
    private _ngZone: NgZone,
    private _gifSvc: GifService,
    private _windowSvc: WindowService,
    private _testSvc: TestService,
    private _elementToPracticeService: ElementToPracticeService,
    private _typeService: TypeService,
    private _nzNotificationService: NzNotificationService
  ) {
    this.form = this._fb.group({
      en: ['', [Validators.required]],
      enPron: this._fb.group({
        score: [''],
        label: this._fb.group({
          en: [''],
          es: [''],
        })
      }),
      type: [typesOfElementsToPractice.word ?? '', [Validators.required]],
      selectedUses: [[], [Validators.required]],
      uses: this._fb.array([]),
      description: this._fb.group({
        en: ['', [Validators.required]],
        es: ['', [Validators.required]],
      }),
      examples: this._fb.array([]),
      gifReference: [''],
      gifs: this._fb.array([]),
      // ...(isWord ? {} : { meanings: this._fb.array([this.newMeaning()]) }),
    });
    if (!this.elementToPractice) {
      this.id = this._route.snapshot.paramMap.get('id');
      this.id ? this.getElementToPractice(this.id) : this.formInit();
    } else this.formInit(this.elementToPractice);

    this._testSvc.etp$.subscribe((etpItem) => {
      // console.log({ etpItem });
      if (!etpItem) return;
      this.form.get('uses')?.reset();
      // this.etpItem = etpItem;
      const { content } = etpItem;
      if (!content) return;
      this.formInit(content.etp, content);
      this.setSupscriptions();

      this.getGifs();
    });

    this.setSupscriptions();
  }

  ngOnInit(): void {
    this.getTypes();

    // this.etpInit();
  }

  public getGifUrl(gif: giphyItem): string {
    return gif.images.fixed_height.url;
  }

  public verbInfoControl(i: number, s?: 'switch'): string {
    if (this.uses.controls[i].get('verbInfo')?.enabled) return s ?? 'input';

    return `${s ?? 'input'} disabled`;
  }

  public isRequired(control: string): boolean {
    return this.form.controls[control].hasValidator(Validators.required);
  }

  public letters(w: string): string[] {
    return w.split('');
  }

  public getControlErrors(control: string): Array<string> {
    return Object.keys(this.form.get(control)?.errors ?? {});
  }

  public setSupscriptions(): void {
    this.form.get('selectedUses')?.valueChanges.subscribe((value) => {
      if (!this.form.get('uses')) return;
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
          verbInfo.patchValue({
            irregular: false,
            simplePast: '',
            pastParticiple: '',
          });
          useControl.enable();
          useControl.get('meanings')?.disable();
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

  public formInit(body?: IElementToPractice | any, content?: IEtp): FormGroup {
    const isWord =
      this.form?.get('type')?.value === typesOfElementsToPractice.word;
    // const bodyForm: FormGroup = this._fb.group({
    let bodyForm: FormGroup = this._fb.group({
      en: ['', [Validators.required]],
      enPron: this._fb.group({
        score: [''],
        label: this._fb.group({
          en: [''],
          es: [''],
        })
      }),
      type: [typesOfElementsToPractice.word ?? '', [Validators.required]],
      selectedUses: [[], [Validators.required]],
      uses: this._fb.array([]),
      description: this._fb.group({
        en: [''],
        es: [''],
      }),
      // examples: this._fb.array([this.newExample()]),
      examples: this._fb.array([]),
      gifReference: [''],
      gifs: this._fb.array([]),
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
      if (body.examples) bodyForm.setControl(
        'examples',
        this._fb.array(
          body.examples.map((exampleVal: string) =>
            this.newExample(!content ? exampleVal : '')
          )
        )
      );
      if (body.gifs) bodyForm.setControl(
        'gifs',
        this._fb.array(
          body.gifs.map((gifVal: string) =>
            this.newGif(!content ? gifVal : '')
          )
        )
      );
      const selectedUses: Array<string> | null = body.selectedUses
        ? body.selectedUses.map(
          (selectedUseItem: IType, j: number) =>
            selectedUseItem.id ?? body.uses[j].id
        )
        : null;

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
          // simPron: this._fb.group({
          //   score: ['', [Validators.required]],
          //   label: ['', [Validators.required]]
          // }),
          // pastParticiple: [''],
          // pastPron: this._fb.group({
          //   score: ['', [Validators.required]],
          //   label: ['', [Validators.required]]
          // }),
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

  public newExample(val?: string): FormControl {
    return new FormControl(val ?? '', [Validators.required]);
  }

  public newGif(val?: string): FormControl {
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

  public addGif(val?: string): void {
    console.log({ val });
    if (this.gifs.value.includes(val)) return
    this.gifs.push(this.newGif(val));
  }

  public removeMeaning(i: number): void {
    // if (this.getMeanings(i).length < 2) return;

    return this.meanings.removeAt(i);
  }

  public addExample(): void {
    this.examples.push(this.newExample());
  }

  public removeExample(i: number): void {
    // if (this.getexamples(i).length < 2) return;

    return this.examples.removeAt(i);
  }

  public removeGif(i: number | string): void {

    return this.gifs.removeAt(typeof i === 'number' ? i : this.gifs.value.findIndex((item: string) => item === i));
  }

  public invalidFormResponse(): NzNotificationRef {
    return this._nzNotificationService.warning(
      'Invalid Form',
      'El formulario no es valido, por favor rectifique los valores ingresados'
    );
  }

  public setUses(): void {
    if (this.etpItem) return;
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
    if (this.etpItem) return;
    if (this.form.get('selectedUses')) this.form.removeControl('selectedUses');

    if (this.form.get('uses')) this.form.removeControl('uses');

    if (!this.form.get('meanings'))
      this.form.setControl('meanings', this._fb.array([this.newMeaning()]));
  }

  public submit(): void | NzNotificationRef {
    console.log({ valid: this.form.valid, value: this.form.value, form: this.form });

    const meanings: Array<string> | null =
      this.form.get('meanings')?.value ?? null;

    // this.word ? this.setUses() : this.removeUses();
    const isWord =
      this.form.get('type')?.value === typesOfElementsToPractice.word;
    isWord ? this.setUses() : this.removeUses();

    // const enPron = this.form.controls['enPron'];
    // this.form.removeControl('enPron');
    if (!this.form.valid) {
      this.setUses();
      this.showErrors = true;
      // this.form.addControl('enPron', enPron);
      return this.invalidFormResponse();
    }
    if (this.etpItem && !this.form.controls['en'].enabled && this.form.controls['enPron'].get('label')?.value.en.length === 0) {
      this.showErrors = true;
      return this.invalidFormResponse();
    }
    this.showErrors = false;

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

    // console.log({ etpItemToCheck: this.etpItem });
    if (this.etpItem) {
      const etpItem = { ...this.etpItem };
      return this.etpEmitter.emit({
        etpItem,
        checkingWord: this.checkingWord,
        formValue: formBody,
      });
    }

    console.log({ formBody });

    this.formInfoEmitter.emit(formBody);

    this.formInit(this.elementToPractice);
    this.setSupscriptions();
  }

  public getGifs(): Subscription | void {
    // if (!this.etpItem) return;
    return this._gifSvc.loadTrendingGifs(this.form.value.gifReference).subscribe(
      giphyResponse => {
        this.gifsToShow = giphyResponse.data;
        this.gif = giphyResponse.data[0];
        console.log({ gif: this.gif });
      },
      error => console.log({ error })
    )
  }

  public evaluatePronunciation(key: string, transcript: string): void {

    // const expectedText = this.form.controls[key].value;
    // console.log({ expectedText, transcript });

    const normalize = (str: string) => str
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const score: number = stringSimilarity.compareTwoStrings(normalize(`${this.form.controls[key].value}.`), normalize(transcript)) * 100;

    if (key != 'en') return;
    this.enPronListening = false;
    return this.form.controls['enPron'].patchValue({
      score,
      label: {
        en: score < 70 ? 'Incorrect' : score < 80 ? 'Acceptable' : score < 90 ? 'Correct' : 'Perfect',
        es: score < 70 ? 'Incorrecto' : score < 80 ? 'Aceptable' : score < 90 ? 'Correcto' : 'Perfecto'
      }
    })

  }

  // public startRecognition(expectedText: string) {
  public startRecognition(key: string) {
    const win = this._windowSvc.nativeWindow;

    if (!win) return;
    this.enPronListening = true;

    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('SpeechRecognition no soportado');
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    // recognition.interimResults = false;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      this._ngZone.run(() => {
        const transcript: string = event.results[0][0].transcript;

        // const result = this.evaluatePronunciation(key, `${expectedText}.`, transcript);
        const result = this.evaluatePronunciation(key, transcript);

        console.log({ result, transcript });
      })
    };

    recognition.onspeechend = () => {
      this._ngZone.run(() => {
        this.enPronListening = false;
        recognition.stop();
      })
    };

    recognition.onerror = (event: any) => {
      this._ngZone.run(() => {
        console.error(event.error);
        this.enPronListening = false;
        recognition.stop();
      })
    };

    recognition.start();
  }

  speak(key: string) {
    const utterance = new SpeechSynthesisUtterance(this.form.controls[key].value);

    utterance.lang = 'en-US';

    speechSynthesis.speak(utterance);
  }
}
