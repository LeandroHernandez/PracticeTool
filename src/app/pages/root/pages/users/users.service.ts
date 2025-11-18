import { Injectable, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  deleteDoc,
  setDoc,
  query,
  where,
  limit,
  startAfter,
  collectionSnapshots,
  Query,
  QueryConstraint,
  QueryDocumentSnapshot,
  DocumentData,
  CollectionReference,
  docData,
  getDoc,
  fromRef,
} from '@angular/fire/firestore';
import { DbCollections } from '../../../../enums';
import { IModule, IUser, IUserB } from '../../../../interfaces';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { RolesService } from '../roles';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector); // ✅ para asegurar contexto
  private _rolesSvc = inject(RolesService);

  // ✅ Inicializa la referencia de forma segura en contexto Angular
  private usersRef = runInInjectionContext(this.injector, () =>
    collection(this.firestore, DbCollections.users) as CollectionReference<IUser>
  );

  public getFilteredUsers(
    filters: Record<string, any> = {},
    options: {
      pageSize?: number;
      startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
    } = {}
  ): Observable<IUser[]> {
    // ✅ Usa runInInjectionContext también aquí
    return runInInjectionContext(this.injector, () => {
      const usersRef = collection(this.firestore, DbCollections.users) as CollectionReference<IUser>;

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
    });
  }

  private executeQuery(
    queryRef: Query<IUserB | any>,
    options: {
      pageSize?: number;
      startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
    }
  ): Observable<any[]> {
    return runInInjectionContext(this.injector, () => {
      const constraints: QueryConstraint[] = [];

      if (options.pageSize) constraints.push(limit(options.pageSize));
      if (options.startAfterDoc) constraints.push(startAfter(options.startAfterDoc));

      const finalQuery = query(queryRef, ...constraints);

      return collectionSnapshots(finalQuery).pipe(
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
    });
  }

  // getUser(id: string): Observable<IUser> {
  //   return runInInjectionContext(this.injector, () => {
  //     const userDoc = doc(this.firestore, `${DbCollections.users}/${id}`);
  //     return docData(userDoc, { idField: 'id' }) as Observable<IUser>;
  //   });
  // }

  getUser(id: string, noPopulate?: boolean): Observable<IUser> {

    return runInInjectionContext(this.injector, () => {
      const userDoc = doc(this.firestore, `${DbCollections.users}/${id}`);

      return docData(userDoc, { idField: 'id' }).pipe(
        switchMap((user: any) => {
          // if (noPopulate) return of(user as IUser);

          const roleId = user.role;
          if (!noPopulate && roleId && typeof roleId === 'string') {
            return this._rolesSvc.getRole(roleId).pipe(
              map((roleData) => ({
                ...user,
                role: roleData,
              }))
            );
          }

          return of(user as IUser);
        })
      );
    });
  }


  public async addUser(data: any): Promise<string> {
    return runInInjectionContext(this.injector, async () => {
      const docRef = await addDoc(this.usersRef, data);
      return docRef.id;
    });
  }

  public async updateUser(id: string, user: Partial<IUser>) {
    return runInInjectionContext(this.injector, async () => {
      const userDoc = doc(this.firestore, `${DbCollections.users}/${id}`);
      return await setDoc(userDoc, user, { merge: true });
    });
  }

  public deleteUser(id: string) {
    return runInInjectionContext(this.injector, () => {
      const userDoc = doc(this.firestore, `${DbCollections.users}/${id}`);
      return deleteDoc(userDoc);
    });
  }
}
