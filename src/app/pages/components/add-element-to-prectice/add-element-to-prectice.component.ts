import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { ElementToPracticeService } from './element-to-practice.service';
import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';
import { IElementToPractice, IType } from '../../../interfaces';
import { TypeService } from '../../types/types.service';
import { RoutesApp } from '../../../constants';

@Component({
  selector: 'app-add-element-to-prectice',
  imports: [ReactiveFormsModule, RouterLink, NzSwitchModule ],
  templateUrl: './add-element-to-prectice.component.html',
  styleUrl: './add-element-to-prectice.component.css'
})
export class AddElementToPrecticeComponent implements OnInit {
  // public types: Array<string> =  ['Verb', 'Adjective', 'Noun', 'Preposition', 'Adverb'];
  
  public elementsToPractice: Array<IElementToPractice> | null = null;
  
  // get testList(): Array<IElementToPractice> | null {
  //   return this.elementsToPracticeService;
  // }

  public testList: Array<IElementToPractice> = [];
  public elementToTest: IElementToPractice | null = null;

  public wordTypeId: string = 'TBKrgXIeg2LaUrMLhD0T';
  public phrasalVerbTypeId: string = 'xZOI61fD1FoE5yO9Bjse';
  public idiomTypeId: string = 'bgndH2gcsCGti1k0i1zb';
  public expressionTypeId: string = 'p3N5Zd4nJVIPTozkJGUm';
  public grammarTypeId: string = 'xZOI61fD1FoE5yO9Bjse';
  public verbId: string = 'cieWObetRIxQzKFddEg4';
  
  public backTo: string = '';

  public startWithWords: boolean = false;

  public types: Array<IType> | null =  null;

  public form: FormGroup;
  public formLabel: string = '';

  public id: string | null = null;
  
  get url(): string {
    return this._router.url;
  }
  
  constructor(
    private _route: ActivatedRoute, 
    private _router: Router, 
    private _fb: FormBuilder, 
    private _typeSvc: TypeService, 
    private _elementToPracticeSvc: ElementToPracticeService, 
    private _notificationSvc: NzNotificationService
  ) {
    this.form = this._fb.group({
      type: [''],
      en: ['', [Validators.required]],
      es: this._fb.array([]),
    })
    if (this.url.startsWith(`/${RoutesApp.words}/`)) {
      this.startWithWords = true;
      this.formLabel = 'Word';
      this.backTo = RoutesApp.words;
      
      this.form.addControl(
        'verbInfo', 
        this._fb.group({
          wordType: [this.verbId, [Validators.required]],
          simplePresent: [''],
          simplePast: [''],
          pastParticiple: [''],
          irregular: [false],
        }),
      );
      this.form.get('type')?.addValidators([Validators.required]);
      this.form.get('type')?.patchValue(this.wordTypeId);
      
    } else if (this.url.startsWith(`/${RoutesApp.phrasalVerbs}/`)) {
      
      // this.getElementsToPractice(this.phrasalVerbTypeId);
      this.formLabel = 'Phrasal Verb';
      this.form.get('type')?.patchValue(this.phrasalVerbTypeId);
      this.backTo = RoutesApp.phrasalVerbs;
      
    } else if (this.url.startsWith(`/${RoutesApp.idioms}/`)) {
      
      // this.getElementsToPractice(this.idiomTypeId);
      this.formLabel = 'Idiom';
      this.form.get('type')?.patchValue(this.idiomTypeId);
      this.backTo = RoutesApp.idioms;
      
    } else if (this.url.startsWith(`/${RoutesApp.expressions}/`)) {
      
      // this.getElementsToPractice(this.expressionTypeId);
      this.formLabel = 'Expression';
      this.form.get('type')?.patchValue(this.expressionTypeId);
      this.backTo = RoutesApp.expressions;
      
    } else if (this.url.startsWith(`/${RoutesApp.grammar}/`)) {
      
      // this.getElementsToPractice(this.grammarTypeId);
      this.formLabel = 'Grammar Lesson';
      this.form.get('type')?.patchValue(this.grammarTypeId);
      this.backTo = RoutesApp.grammar;

    }
    
    if (this.url.endsWith('test')) {
      this.getElementsToPractice(this.form.value.type);
      this.form.get('en')?.disable();
    }

    this.id = this._route.snapshot.paramMap.get('id');
    this.id ? this.getElementToPractice(this.id) : false;

  }

  ngOnInit(): void {
    this.form.get('type')?.valueChanges.subscribe(value => {
      this.typeChange(value);
    });

    !this.id ? this.addItem() : false;
    
    this.getTypes();
  }

  public getElementsToPractice(typeId?: string): void {
    this._elementToPracticeSvc.getElementsToPractice(typeId).subscribe(
      (elementsToPractice) => {
        this.testList = [...elementsToPractice];
        this.elementsToPractice = elementsToPractice;

        this.changeElementToPractice();
      }
    )
  };

  public getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  // Ahora, tanto el valor mínimo como el máximo están incluidos en el resultado.
  

  public changeElementToPractice(i?: number): void {
    // this.testList = this.elementsToPractice ?? [];

    this.es.reset();
    this.esClear();
    if (this.startWithWords) {
      // this.verbInfo?.get('wordType')?.patchValue(this.verbId);
      this.form.controls['verbInfo'].patchValue({
        wordType: this.verbId,
        simplePresent: '',
        simplePast: '',
        pastParticiple: '',
        irregular: false,
      })
    } 
    let randomNum: number = 0;
    if (i) {
      randomNum = i;
      while (randomNum === i) {
        randomNum = this.getRandomIntInclusive(0, this.testList.length - 1);
      }
    }
    // this.elementToTest = this.testList[this.getRandomIntInclusive(0, this.testList.length - 1)];
    this.elementToTest = this.testList[!i ? this.getRandomIntInclusive(0, this.testList.length - 1): randomNum];
    this.form.get('en')?.patchValue(this.elementToTest.en);
  };

  public check(item: IElementToPractice): void | NzNotificationRef {
    const inputMeanings: Array<string> = this.form.value.es.map((meaning: any) => meaning.value.toLowerCase());
    const meanings: Array<string> = item.es.map((meaning) => meaning.value.toLowerCase());

    const errorCounter: Array<string> = [];

    inputMeanings.forEach(
      (inputItem) => {
        if (!meanings.includes(inputItem)) {
          errorCounter.push(inputItem);
        }
      }
    )

    // const i: number = this.testList.splice(this.testList.findIndex((itemToCompare) => itemToCompare === item), 1);
    const i: number = this.testList.findIndex((itemToCompare) => itemToCompare === item);
    
    if (errorCounter.length > 0) {
      this._notificationSvc.warning('Error', `Mistakes: " [ ${ errorCounter } ] " and The right meaings are: [ ${ meanings } ]`);
      return this.youLose(i);
    }
    
    if (inputMeanings.length !== meanings.length) {
      this._notificationSvc.warning('Error', `Entered ${ inputMeanings.length } meanings: " [ ${ inputMeanings } ] " and The right meaings are these ${ meanings.length }: [ ${ meanings } ]`);
      return this.youLose(i);
    }
    
    if (this.startWithWords) {
      const itemVerbInfo: any = this.form.value.verbInfo
      if (itemVerbInfo.wordType === this.verbId) {
        if (itemVerbInfo.irregular !== item.verbInfo?.irregular) {
          this._notificationSvc.warning('Error', `Setted as: " ${ itemVerbInfo.irregular ? 'Regular' : 'Irregular' } " and it really is: " ${ item.verbInfo?.irregular ? 'Regular' : 'Irregular' } "`);
          return this.youLose(i)
        } 
        if (itemVerbInfo.simplePresent !== item.verbInfo?.simplePresent) {
          this._notificationSvc.warning('Error', `Simple Present Entered: " ${ itemVerbInfo.simplePresent } " and it really is: " ${ item.verbInfo?.simplePresent } "`);
          return this.youLose(i)
        } 
        if (itemVerbInfo.simplePast !== item.verbInfo?.simplePast) {
          this._notificationSvc.warning('Error', `Simple Past Entered: " ${ itemVerbInfo.simplePast } " and it really is: " ${ item.verbInfo?.simplePast } "`);
          return this.youLose(i)
        } 
        if (itemVerbInfo.pastParticiple !== item.verbInfo?.pastParticiple) {
          this._notificationSvc.warning('Error', `Past Participle Entered: " ${ itemVerbInfo.pastParticiple } " and it really is: " ${ item.verbInfo?.pastParticiple } "`);
          return this.youLose(i)
        } 
        if (itemVerbInfo.wordType !== item.verbInfo?.wordType.id) {
          console.log({ enteredWordTypeId: itemVerbInfo.wordType, wordType: item.verbInfo?.wordType })
          // this._notificationSvc.warning('Error', `Type Entered: " ${ itemVerbInfo.wordType } " and it really is: " ${ item.verbInfo?.wordType } "`);
          this._notificationSvc.warning('Error', ` Wrong Type selected the right one is: " ${ item.verbInfo?.wordType.name } "`);
          return this.youLose(i)
        } 
      }
    }
    
    this.testList.splice(i, 1);

    this.esClear();

    if (this.testList.length < 1) this.youWin();

    this.changeElementToPractice(i);
  }

  public youLose(i: number): void {
    if (this.elementsToPractice) this.testList = this.elementsToPractice;
    this.changeElementToPractice(i);
  }
  
  public youWin(): void {
    if (this.elementsToPractice) this.testList = this.elementsToPractice;
    this._notificationSvc.success('You Win', `You have successfully reviewed the ${ this.elementsToPractice?.length } ${ this.formLabel }s`);
  }

  public getTypes(): void {
    this._typeSvc.getTypesByFather(this.wordTypeId).subscribe(
      (types) => {
        this.types = types;
      }, (error) => {
        console.log({error});
        this._notificationSvc.error('Internal Error', 'There was an error so it was not possible to load the types')
      }
    )
  };
  
  get es(): FormArray {
    return this.form.controls["es"] as FormArray;
  }
  
  get verbInfo(): FormGroup | null {
    return this.form.controls["verbInfo"] as FormGroup ?? null;
  }

  public formInit(elementToPractice: IElementToPractice): void {
    this.es.clear();

    elementToPractice.es.forEach(
      (meaning: any) => {
        const newItem = this.newItem(meaning.value);
        this.es.push(newItem);
      }
    );
    const value: any = { ...elementToPractice }
    this.form.patchValue(value);
  }

  public getElementToPractice(id: string): void {
    this._elementToPracticeSvc.getElementToPractice(id).subscribe(
      (elementToPractice) => {
        this.formInit(elementToPractice);
      }
    )
  }

  public newItem(value?: string): FormGroup {
    return this._fb.group({
      value: [ value ?? '', Validators.required],
    });
  }

  public addItem() {
    this.es.push(this.newItem());
  }

  public removeItem(index: number) {
    if (this.es.length === 1) {
      return;
    }
    this.es.removeAt(index);
  }
  
  
  public typeChange(value: string): void | undefined {
    if (value !== 'Verb') {
      return this.form.get('irregular')?.setValue(false);
    }
    return;
  }
  
  public esClear(): void {
    while (this.es.length > 1) {
      this.removeItem(this.es.length - 1);
    }
  }

  public submitButton(): string {
    if (!this.url.endsWith('test')) {
      return `${!this.id ? 'Register' : 'Update'} ${this.formLabel}`;
    }
    return 'validar'
  }
  
  public submit(): void | NzNotificationRef {
    if (!this.form.valid) {
      return this.invalidForm();
    }

    if ( this.elementToTest && this.url.endsWith('test')) {
      return this.check(this.elementToTest);
    }

    if (!this.id) {
      this._elementToPracticeSvc.addElementToPractice(this.form.value)
      .then(
        (response)=> {
          this.form.reset();
          this.esClear();
          if (this.startWithWords) {
            this.form.get('type')?.patchValue(this.wordTypeId);
            this.form.controls['verbInfo'].get('wordType')?.patchValue(this.verbId);
          }
          if (this.url.startsWith(`/${RoutesApp.phrasalVerbs}/`)) {
            this.form.get('type')?.patchValue(this.phrasalVerbTypeId);
          } else if (this.url.startsWith(`/${RoutesApp.idioms}/`)) {
            this.form.get('type')?.patchValue(this.idiomTypeId);
          } else if (this.url.startsWith(`/${RoutesApp.grammar}/`)) {
            this.form.get('type')?.patchValue(this.grammarTypeId);
          }
          
          this.successAdd();
        }
      );
    } else {
      this._elementToPracticeSvc.updateElementToPractice(this.id, this.form.value)
      .then(
        (updateResponse)=> {
          this.successUpdate();
        }
      );
    }
    if (this.startWithWords) {
      // this.form.get('verbInfo')?.get('wordType').setValue(this.verbId);
      if (this.verbInfo) {
        this.verbInfo.get('worType')?.setValue(this.verbId);
      }
    }
  }
  
  invalidForm(): void {
    this._notificationSvc.warning('Invalid', 'The form is invalid.')
  }
  
  successAdd(): void {
    this._notificationSvc.success('Element To Practice Added', 'The Element To Practice was added successfully.')
  }

  successUpdate(): void {
    this._notificationSvc.success('Element To Practice Updated', 'The Element To Practice was updated successfully.')
  }

}
