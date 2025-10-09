import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  deleteDoc,
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
import { IRole, TRole } from '../../../../interfaces';
import { DbCollections, typesOfWords } from '../../../../enums';
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

  getFilteredRoles(
    filters: Record<string, any> = {},
    options: {
      pageSize?: number;
      startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
    } = {}
  ): Observable<IRole[]> {

    const rolesRef = collection(
      this.firestore,
      DbCollections.roles
    ) as CollectionReference<TRole>;

    function extractValidFilters(obj: any, prefix = ''): [string, any][] {
      return Object.entries(obj).flatMap(([key, val]) => {
        if (val === null || val === '') return [];
        if (typeof val === 'object' && !Array.isArray(val)) {
          return extractValidFilters(val, `${prefix}${key}.`);
        }
        return [[`${prefix}${key}`, val]];
      });
    }
    
    const validFilters = extractValidFilters(filters);
    const constraints: QueryConstraint[] = [];



    for (const [path, value] of validFilters) {

      constraints.push(where(path, '==', value));
    }


  if (options.pageSize) {
    constraints.push(limit(options.pageSize));
  }

  if (options.startAfterDoc) {
    constraints.push(startAfter(options.startAfterDoc));
  }
    
    const baseQuery = query(rolesRef, ...constraints);

  return collectionSnapshots(baseQuery).pipe(
    map((snapshot) => snapshot.map((doc) => ({ id: doc.id, ...doc.data() }))),
    switchMap((elements: any[]) => {
      const enrichedElements$ = elements.map((element) => {
        return of(element);
      });

      return enrichedElements$.length > 0
        ? combineLatest(enrichedElements$)
        : of([]);
    })
  );
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
      merge: true,
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
