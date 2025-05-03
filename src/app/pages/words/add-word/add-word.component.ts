import { Component } from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { WordService } from '../words.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IWord } from '../../../interfaces';


@Component({
  selector: 'app-add-word',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NzSwitchModule ],
  templateUrl: './add-word.component.html',
  styleUrl: './add-word.component.css'
})
export class AddWordComponent {
  public types: Array<string> =  ['Verb', 'Adjective', 'Noun', 'Preposition', 'Adverb'];

  public form: FormGroup;

  public id: string | null = null;
  
  constructor(
    private _route: ActivatedRoute, 
    private _fb: FormBuilder, 
    private _wordSvc: WordService, 
    private _notificationSvc: NzNotificationService
  ) {
    this.form = this._fb.group({
        type: ['Verb', [Validators.required]],
        en: ['', [Validators.required]],
        simplePresent: [''],
        simplePast: [''],
        pastParticiple: [''],
        // es: this._fb.array([
        //   this._fb.group({
        //     value: ['', Validators.required],
        //   })
        // ]),
        es: this._fb.array([]),
        
        irregular: [false],
      })
      // const id: string | null = this._route.snapshot.paramMap.get('id');
      this.id = this._route.snapshot.paramMap.get('id');
      this.id ? this.getWord(this.id) : false;
      // this._route.queryParams.subscribe(params => {
      //   const id = params['id'];
      //   console.log({params, id});
      // });
  }

  ngOnInit(): void {
    this.form.get('type')?.valueChanges.subscribe(value => {
      this.typeChange(value);
    });

    !this.id ? this.addItem() : false;
  }
  
  get es(): FormArray {
    return this.form.controls["es"] as FormArray;
  }

  public formInit(word: IWord): void {
    this.es.clear();

    word.es.forEach(
      (meaning: any) => {
        const newItem = this.newItem(meaning.value);
        this.es.push(newItem);
      }
    );
    this.form.patchValue({
      type: word.type,
      en: word.en,
      simplePresent: word.simplePresent,
      simplePast: word.simplePast,
      pastParticiple: word.pastParticiple,
      irregular: word.irregular,
    });
  }

  public getWord(id: string): void {
    this._wordSvc.getWord(id).subscribe(
      (word) => {
        this.formInit(word);
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
  
  public submit(): void {
    if (!this.form.valid) {
      return this.invalidForm();
    }
    console.log({ value: this.form.value });
    if (!this.id) {
      this._wordSvc.addWord(this.form.value)
      .then(
        (response)=> {
          console.log({response});
          this.form.reset();
          this.form.get('type')?.setValue('Verb')
          this.successAdd();
        }
      );
    } else {
      this._wordSvc.updateWord(this.id, this.form.value)
      .then(
        (updateResponse)=> {
          console.log({updateResponse});
          this.successUpdate();
        }
      );
    }
  }
  
  invalidForm(): void {
    this._notificationSvc.warning('Invalid', 'The form is invalid.')
  }
  
  successAdd(): void {
    this._notificationSvc.success('Word Added', 'The word was added successfully.')
  }

  successUpdate(): void {
    this._notificationSvc.success('Word Updated', 'The word was updated successfully.')
  }
}
