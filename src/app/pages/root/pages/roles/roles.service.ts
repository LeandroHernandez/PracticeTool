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
  where,
  QueryConstraint,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
  collectionSnapshots,
} from '@angular/fire/firestore';
import { combineLatest, from, map, Observable, of, switchMap } from 'rxjs';
import { IRole } from '../../../../interfaces';
import { DbCollections, typesOfWords } from '../../../../constants';
import { TypeService } from '../types/types.service';
import { Query, setDoc } from 'firebase/firestore';


@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private rolesRef: CollectionReference<IRole>;

  constructor(private firestore: Firestore) {
    this.rolesRef = collection(
      this.firestore,
      DbCollections.roles
    ) as CollectionReference<IRole>;
  }

  getRoles(): Observable<IRole[]> {
    return collectionData(this.rolesRef, {
      idField: 'id',
    }) as Observable<IRole[]>;
  }

  getRole(id: string): Observable<IRole> {
    const roleDoc = doc(
      this.firestore,
      `${DbCollections.roles}/${id}`
    );
    return docData(roleDoc, {
      idField: 'id',
    }) as Observable<IRole>;
  }

  async addRole(data: IRole | any): Promise<string> {
    const docRef = await addDoc(this.rolesRef, data);
    return docRef.id;
  }

  async updateRole(
    id: string,
    role: Partial<IRole>
  ) {
    const roleDoc = doc(
      this.firestore,
      `${DbCollections.roles}/${id}`
    );
    return await setDoc(roleDoc, role, {
      merge: false,
    });
  }

  deleteRole(id: string) {
    const roleDoc = doc(
      this.firestore,
      `${DbCollections.roles}/${id}`
    );
    return deleteDoc(roleDoc);
  }
}
