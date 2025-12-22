import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { IEtpItem } from '../../../../interfaces';
import { collectionData, collectionSnapshots, docData, Firestore } from '@angular/fire/firestore';
import { addDoc, collection, CollectionReference, deleteDoc, doc, DocumentData, getDoc, limit, query, QueryConstraint, QueryDocumentSnapshot, setDoc, startAfter, where } from 'firebase/firestore';
import { DbCollections } from '../../../../enums';
import { ITest, TTestBody } from '../../../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private _etpSubject = new BehaviorSubject<IEtpItem | null>(null);
  private _testStatus = new BehaviorSubject<boolean>(false);
  // etp$ = this._etpSubject.asObservable();
  constructor() { }

  get etp$() {
    return this._etpSubject.asObservable();
  }

  get current() {
    return this._etpSubject.value;
  }

  get currentStatus() {
    return this._testStatus.value;
  }

  setEtp(value: IEtpItem | null) {
    this._etpSubject.next(value);
  }

  reset() {
    this._etpSubject.next(null);
  }

  setStatus(status: boolean) {
    this._testStatus.next(status);
  }

  // service


  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector); // ✅ para asegurar contexto
  private testsRef = runInInjectionContext(this.injector, () =>
    collection(this.firestore, DbCollections.tests) as CollectionReference<ITest>
  );

  getTests(): Observable<ITest[]> {
    return runInInjectionContext(this.injector, () => collectionData(this.testsRef, {
      idField: 'id',
    }) as Observable<ITest[]>);
  }

  getFilteredTests(
    filters: Record<string, any> = {},
    options: {
      pageSize?: number;
      startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
    } = {}
  ): Observable<ITest[]> {
    return runInInjectionContext(this.injector, () => {

      const testsRef = collection(
        this.firestore,
        DbCollections.tests
      ) as CollectionReference<TTestBody>;

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

      const baseQuery = query(testsRef, ...constraints);

      return collectionSnapshots(baseQuery).pipe(
        map((snapshot) => snapshot.map((doc) => ({ id: doc.id, ...doc.data() }))),
        // switchMap((elements: any[]) => {
        //   const enrichedElements$ = elements.map((element) => {
        //     return of(element);
        //   });

        //   return enrichedElements$.length > 0
        //     ? combineLaTest(enrichedElements$)
        //     : of([]);
        // })
      );
    });
  }

  // getTest(id: string, noPopulate?: boolean): Observable<ITest> {
  //   return runInInjectionContext(this.injector, () => {
  //     const testDoc = doc(this.firestore, `${DbCollections.tests}/${id}`);

  //     return docData(testDoc, { idField: 'id' }).pipe(
  //       switchMap((test: any) => {
  //         if (noPopulate) return of(test as ITest);

  //         // Acepta ambos nombres por si hay inconsistencias
  //         const assigned: string[] = test.assignedModules || test.asignnedModules;

  //         if (!assigned || !Array.isArray(assigned) || assigned.length === 0) {
  //           return of(test as ITest);
  //         }

  //         // Creamos un array de promesas que traen cada módulo por su document id
  //         const modulePromises = assigned.map((moduleId: string) => {
  //           return runInInjectionContext(this.injector, () => {
  //             const moduleDocRef = doc(this.firestore, `${DbCollections.modules}/${moduleId}`);
  //             return getDoc(moduleDocRef).then((snapshot: any) => {
  //               if (!snapshot.exists()) return null;
  //               return { id: snapshot.id, ...(snapshot.data() as any) } as IModule;
  //             });
  //           });
  //         });

  //         // from(Promise.all(...)) convierte la promesa en un Observable
  //         return from(Promise.all(modulePromises)).pipe(
  //           map(mods => (mods.filter(Boolean) as IModule[])), // filtra nulos
  //           map((modules: IModule[]) => ({
  //             ...test,
  //             assignedModules: modules, // remplaza ids por documentos completos
  //           } as ITest))
  //         );
  //       })
  //     );
  //   });
  // }

  async addTest(data: TTestBody): Promise<string> {
    return runInInjectionContext(this.injector, async () => {
      const docRef = await addDoc(this.testsRef, data);
      return docRef.id;
    });
  }

  async updateTest(
    id: string,
    test: Partial<ITest>
  ) {
    return runInInjectionContext(this.injector, async () => {
      const testDoc = doc(
        this.firestore,
        `${DbCollections.tests}/${id}`
      );
      return await setDoc(testDoc, test, {
        merge: true,
      });
    });
  }

  deleteTest(id: string) {
    return runInInjectionContext(this.injector, () => {
      const testDoc = doc(
        this.firestore,
        `${DbCollections.tests}/${id}`
      );
      return deleteDoc(testDoc);
    });
  }
}
