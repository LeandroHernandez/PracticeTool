import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  docData,
  CollectionReference,
  query,
  where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { IType } from '../../../../interfaces';
import { DbCollections } from '../../../../enums';

@Injectable({
  providedIn: 'root',
})
export class TypeService {
  // private typesRef: CollectionReference<IType>;

  // constructor(private firestore: Firestore) {
  //   this.typesRef = collection(this.firestore, DbCollections.types) as CollectionReference<IType>;
  // }

  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector);
  private typesRef = runInInjectionContext(this.injector, () =>
    collection(this.firestore, DbCollections.types) as CollectionReference<IType>
  );

  getTypes(): Observable<IType[]> {
    return runInInjectionContext(this.injector, () =>
      collectionData(this.typesRef, { idField: 'id' }) as Observable<IType[]>
    );
  }

  getType(id: string): Observable<IType> {
    return runInInjectionContext(this.injector, () => {
      const typeDoc = doc(this.firestore, `${DbCollections.types}/${id}`);
      return docData(typeDoc, { idField: 'id' }) as Observable<IType>;
    });
  }

  getTypesByField(field: string, value: string): Observable<any[]> {
    return runInInjectionContext(this.injector, () => {
      const typesRef = collection(this.firestore, DbCollections.types);
      const typesQuery = query(typesRef, where(field, '==', value));
      return collectionData(typesQuery, { idField: 'id' });
    });
  }

  getTypesByFather(fatherId: string): Observable<any[]> {
    return runInInjectionContext(this.injector, () => {
      const typesRef = collection(this.firestore, DbCollections.types);
      const typesQuery = query(typesRef, where('father', '==', fatherId));
      return collectionData(typesQuery, { idField: 'id' });
    });
  }

  addType(type: IType) {
    return runInInjectionContext(this.injector, () => addDoc(this.typesRef, type));
  }

  updateType(id: string, type: Partial<IType>) {
    return runInInjectionContext(this.injector, () => {
      const typeDoc = doc(this.firestore, `${DbCollections.types}/${id}`);
      return updateDoc(typeDoc, type);
    });
  }

  deleteType(id: string) {
    return runInInjectionContext(this.injector, () => {
      const typeDoc = doc(this.firestore, `${DbCollections.types}/${id}`);
      return deleteDoc(typeDoc);
    });
  }
}
