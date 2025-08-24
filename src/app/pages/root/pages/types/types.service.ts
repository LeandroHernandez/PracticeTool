import { Injectable } from '@angular/core';
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
import { DbCollections } from '../../../../constants';

@Injectable({
  providedIn: 'root',
})
export class TypeService {
  private typesRef: CollectionReference<IType>;

  constructor(private firestore: Firestore) {
    this.typesRef = collection(this.firestore, DbCollections.types) as CollectionReference<IType>;
  }

  getTypes(): Observable<IType[]> {
    return collectionData(this.typesRef, { idField: 'id' }) as Observable<IType[]>;
  }

  getType(id: string): Observable<IType> {
    // const typeDoc = doc(this.firestore, `types/${id}`);
    const typeDoc = doc(this.firestore, `${DbCollections.types}/${id}`);
    return docData(typeDoc, { idField: 'id' }) as Observable<IType>;
  }
  
  getTypesByField(field: string, value: string): Observable<any[]> {
    const typesRef = collection(this.firestore, DbCollections.types);
    const typesQuery = query(typesRef, where(field, '==', value));
    return collectionData(typesQuery, { idField: 'id' });
  }
  
  getTypesByFather(fatherId: string): Observable<any[]> {
    const typesRef = collection(this.firestore, DbCollections.types);
    const typesQuery = query(typesRef, where('father', '==', fatherId));
    return collectionData(typesQuery, { idField: 'id' });
  }

  addType(type: IType) {
    return addDoc(this.typesRef, type);
  }

  updateType(id: string, type: Partial<IType>) {
    // const typeDoc = doc(this.firestore, `types/${id}`);
    const typeDoc = doc(this.firestore, `${DbCollections.types}/${id}`);
    return updateDoc(typeDoc, type);
  }

  deleteType(id: string) {
    // const typeDoc = doc(this.firestore, `types/${id}`);
    const typeDoc = doc(this.firestore, `${DbCollections.types}/${id}`);
    return deleteDoc(typeDoc);
  }
}
