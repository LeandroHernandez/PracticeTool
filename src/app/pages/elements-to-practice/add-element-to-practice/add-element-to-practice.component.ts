import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { RoutesApp, typesOfElementsToPractice } from '../../../constants';

import { NzNotificationRef, NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { TypeService } from '../../types/types.service';
import { Subscription } from 'rxjs';
import { IType } from '../../../interfaces';
import { ElementToPracticeService } from '../element-to-practice.service';

@Component({
  selector: 'app-add-element-to-practice',
  imports: [ReactiveFormsModule, RouterLink, NzSwitchModule, NzSelectModule ],
  templateUrl: './add-element-to-practice.component.html',
  styleUrl: './add-element-to-practice.component.css'
})
export class AddElementToPracticeComponent implements OnInit {

  public backTo: string = RoutesApp.elementsToPractice;
  // public usesList: Array<string> = [ 'Word', 'Phrasal Verb', 'Idiom', 'Expression', 'Grammar' ];
  public typesList: Array<any> = [];
  public usesList: Array<any> = [];

  public form: FormGroup;
  
  public verbId: string = typesOfElementsToPractice.verb;

  constructor (
    private _fb: FormBuilder, 
    private _elementToPracticeService: ElementToPracticeService, 
    private _typeService: TypeService, 
    private _nzNotificationService: NzNotificationService
  ) {
    this.form = this._fb.group({});
    this.formInit();
  }

  get type(): FormControl {
    return this.form.get('type') as FormControl;
  }

  get grammarLesson(): boolean {
    return this.type.value === typesOfElementsToPractice.grammarLesson ? true : false;
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

    this.form.get('selectedUses')?.valueChanges.subscribe(value => {
      this.selectedUsesChange(value);
    });

    this.form.get('type')?.valueChanges.subscribe(() => {
      this.typeChange();
    });
  }

  // public formInit(): FormGroup {
  //   return this.form = this._fb.group({
  //     en: ['', [Validators.required]],
  //     type: [ typesOfElementsToPractice.word ?? '', [Validators.required]],
  //     selectedUses: [[], [Validators.required]],
  //     uses: this._fb.array([]),
  //   });
  // }
  public formInit(): FormGroup {
  const isWord = this.form?.get('type')?.value === typesOfElementsToPractice.word;
  return this.form = this._fb.group({
    en: ['', [Validators.required]],
    type: [typesOfElementsToPractice.word ?? '', [Validators.required]],
    selectedUses: [[], [Validators.required]],
    uses: this._fb.array([]),
    ...(isWord ? {} : { meanings: this._fb.array([this.newMeaning()]) }),
  });
}

  
  public getTypes(): Subscription {
    return this._typeService.getTypes().subscribe(
      (types) => {
        this.typesList = [];
        this.usesList = [];
        types.forEach(type => {
          if (!type.father) return this.typesList.push(type);
          return this.usesList.push(type);
        })
      },
      (error) => console.log({error}),
    );
  };

  public selectedUsesChange(selectedUses: Array<IType | any>): void {
    console.log({ selectedUses });
    
    this.uses.controls.forEach((useItem: any, i: any) => {
      const registeredIndex = selectedUses.findIndex( selectedItem => selectedItem.id === useItem.value.id);
      console.log({ registeredIndex, useItem })
      if (registeredIndex >= 0) {
        selectedUses[registeredIndex].meanings = useItem.controls['meanings'];
        if (selectedUses[registeredIndex].id === this.verbId) selectedUses[registeredIndex].verbInfo = useItem.controls.verbInfo;
      }
    });

    this.uses.clear();

    selectedUses.forEach(selectedItem => {
      // if (this.uses.value.includes((useItem: any) => useItem.id === selectedItem.id)) return;
      if (this.uses.controls.find(control => control.get('id')?.value === selectedItem.id)) return;
      // return this.uses.push(
      //   this._fb.group({
      //     id: [selectedItem.id],
      //     name: [selectedItem.name],
      //     // meanings: selectedItem.meanings ?? this._fb.array([]),
      //     meanings: selectedItem.meanings ?? this._fb.array([ this.newMeaning() ]),
      //   })
      // );
      const use: FormGroup = this._fb.group({
        id: [selectedItem.id],
        name: [selectedItem.name],
        // meanings: selectedItem.meanings ?? this._fb.array([]),
        meanings: selectedItem.meanings ?? this._fb.array([ this.newMeaning() ]),
      })

      if (selectedItem.id === this.verbId) {
        use.setControl('verbInfo', selectedItem.verbInfo ?? this._fb.group({
          irregular: [false],
          simplePast: [''],
          pastParticiple: [''],
        }))
      }

      return this.uses.push(use);
    })

  };

  public typeChange(): void {
    if (!this.word) return this.form.setControl('meanings', this._fb.array([this.newMeaning()]));
    
    return this.form.removeControl('meanings');
  }

  public getMeanings(i: number): FormArray {
    return this.uses.controls[i].get('meanings') as FormArray
  }

  public newMeaning(): FormControl {
    return new FormControl('', [Validators.required]);
  }

  public addWordMeaning(i: number): void {
    this.getMeanings(i).push(this.newMeaning())
  }

  public removeWordMeaning(i: number, j: number): void {
    if (this.getMeanings(i).length < 2) return;

    return this.getMeanings(i).removeAt(j);
  }

  public addMeaning(): void {
    this.meanings.push(this.newMeaning())
  }

  public removeMeaning(i: number): void {
    if (this.getMeanings(i).length < 2) return;

    return this.meanings.removeAt(i);
  }

  public invalidFormResponse(): NzNotificationRef {
    return this._nzNotificationService.warning('Invalid Form', 'El formulario no es valido, por favor rectifique los valores ingresados');
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
  if (!this.form.get('selectedUses')) this.form.addControl('selectedUses', new FormControl([], [Validators.required]));
  
  if (!this.form.get('uses')) this.form.addControl('uses', this._fb.array([]));

  if (!this.form.get('meanings')) this.form.addControl('meanings', this._fb.array([this.newMeaning()]));
  
}

public removeUses(): void {
  if (this.form.get('selectedUses')) this.form.removeControl('selectedUses');
  
  if (this.form.get('uses')) this.form.removeControl('uses');

  if (this.form.get('meanings')) this.form.removeControl('meanings');
}


  public submit(): void | NzNotificationRef {
    console.log({ valid: this.form.valid, value: this.form.value, });
    console.log({ word: this.word });
    
    this.word ? this.setUses() : this.removeUses();

    if (!this.form.valid) {
      this.setUses();
      return this.invalidFormResponse();
    }
    
    const plainUses = this.uses.controls.map(control => {
      const base = {
        id: control.get('id')?.value,
        name: control.get('name')?.value,
        meanings: control.get('meanings')?.value,
      };
      if (control.get('verbInfo')) {
        return { ...base, verbInfo: control.get('verbInfo')?.value };
      }
      return base;
    });

    const body = {...this.form.value, uses: plainUses}
    
    if (this.word) delete body.meanings;
    
    console.log({body})

    this._elementToPracticeService.addElementToPractice(body)
    .then(reponse => {
          console.log({ reponse });
          this.formInit();
        }
      )
    .catch(error => console.log({ error }))
  }; 
}
