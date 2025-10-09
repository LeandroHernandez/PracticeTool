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
  Query,
  setDoc,
} from '@angular/fire/firestore';
import { DbCollections } from '../../../../enums';
import { IUser, TUser } from '../../../../interfaces';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { RolesService } from '../roles';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private usersRef: CollectionReference<IUser>;

  constructor(private firestore: Firestore, private _rolesSvc: RolesService) {
    this.usersRef = collection(
      this.firestore,
      DbCollections.users
    ) as CollectionReference<IUser>;
  }

  public getFilteredUsers(
    filters: Record<string, any> = {},
    options: {
      pageSize?: number;
      startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
    } = {}
  ): Observable<IUser[]> {

    // console.log({ filters: {...filters} });
    const usersRef = collection(
      this.firestore,
      DbCollections.users
    ) as CollectionReference<IUser>;

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
    
    const baseQuery = query(usersRef, ...constraints);
    
    return this.executeQuery(baseQuery, options);
  }
  
private executeQuery(
  queryRef: Query<TUser>,
  options: {
    pageSize?: number;
    startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
  }
): Observable<any[]> {
  const constraints: QueryConstraint[] = [];

  if (options.pageSize) {
    constraints.push(limit(options.pageSize));
  }

  if (options.startAfterDoc) {
    constraints.push(startAfter(options.startAfterDoc));
  }

  const finalQuery = query(queryRef, ...constraints);

  return collectionSnapshots(finalQuery).pipe(
    // map((snapshot) => snapshot.map((doc) => ({ id: doc.id, ...doc.data() }))),
    map((snapshot) => snapshot.map((doc) => ({ id: doc.id, ...doc.data() }))),
    switchMap((elements: any[]) => {
      const enrichedElements$ = elements.map((element: IUser) => {
        const roleId = element.role;

        if (roleId && typeof roleId === 'string') {
          return this._rolesSvc.getRole(roleId).pipe(
            map((roleData) => ({
              ...element,
              role: roleData,
            }))
          );
        }

        return of(element);
      });

      return enrichedElements$.length > 0
        ? combineLatest(enrichedElements$)
        : of([]);
    })
  );
}

  public async addUser(data: any): Promise<string> {
    const docRef = await addDoc(this.usersRef, data);
    return docRef.id;
  }

  public async updateUser(
    id: string,
    user: Partial<IUser>
  ) {
    const userDoc = doc(
      this.firestore,
      `${DbCollections.users}/${id}`
    );
    return await setDoc(userDoc, user, {
      merge: false,
    });
  }

  public deleteUser(id: string) {
    const userDoc = doc(
      this.firestore,
      `${DbCollections.users}/${id}`
    );
    return deleteDoc(userDoc);
  }
}
