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

import { DbCollections, typesOfWords } from '../../../../enums';
import { IElementToPractice } from '../../../../interfaces';

import { TypeService } from '../types/types.service';

import { Query, setDoc } from 'firebase/firestore';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Injectable({
  providedIn: 'root',
})
export class ElementToPracticeService {
  // private elementToPracticesRef: CollectionReference<IElementToPractice>;

  // constructor(private firestore: Firestore, private _typeSvc: TypeService) {
  //   this.elementToPracticesRef = collection(
  //     this.firestore,
  //     DbCollections.elementsToPractice
  //   ) as CollectionReference<IElementToPractice>;
  // }

  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector);
  private elementToPracticesRef = runInInjectionContext(this.injector, () =>
    collection(this.firestore, DbCollections.elementsToPractice) as CollectionReference<IElementToPractice>
  );

  private _typeSvc = inject(TypeService);
  private _nzNotificationSvc = inject(NzNotificationService)

  getElementsToPractice(typeId?: string): Observable<IElementToPractice[]> {

    return runInInjectionContext(this.injector, () => {
      if (typeId) {
        return this.getElementsToPracticeByType(typeId);
      }
      return collectionData(this.elementToPracticesRef, {
        idField: 'id',
      }) as Observable<IElementToPractice[]>;
    });
  }

  getElementToPractice(id: string): Observable<IElementToPractice> {
    return runInInjectionContext(this.injector, () => {
      // const elementToPracticeDoc = doc(this.firestore, `elementToPractices/${id}`);
      const elementToPracticeDoc = doc(
        this.firestore,
        `${DbCollections.elementsToPractice}/${id}`
      );
      return docData(elementToPracticeDoc, {
        idField: 'id',
      }) as Observable<IElementToPractice>;
    });
  }

  // getElementsToPracticeByType(typeId: string): Observable<any[]> {
  //   const ElementsToPracticeRef = collection(this.firestore, DbCollections.elementsToPractice);
  //   const ElementsToPracticeQuery = query(ElementsToPracticeRef, where('type', '==', typeId));
  //   return collectionData(ElementsToPracticeQuery, { idField: 'id' });
  // }

  getElementsToPracticeByType(typeId: string): Observable<any[]> {

    return runInInjectionContext(this.injector, () => {
      const ElementsToPracticeRef = collection(
        this.firestore,
        DbCollections.elementsToPractice
      );
      const ElementsToPracticeQuery = query(
        ElementsToPracticeRef,
        where('type', '==', typeId)
      );

      return collectionData(ElementsToPracticeQuery, { idField: 'id' }).pipe(
        switchMap((elements: any[]) => {
          const enrichedElements$ = elements.map((element) => {
            const wordTypeId = element.verbInfo?.wordType;

            if (wordTypeId) {
              return this._typeSvc.getType(wordTypeId).pipe(
                map((wordTypeData) => {
                  return {
                    ...element,
                    verbInfo: {
                      ...element.verbInfo,
                      wordType: wordTypeData, // Aquí reemplazas el ID por el objeto
                    },
                  };
                })
              );
            }

            return of(element); // Si no hay wordType, simplemente regresa el elemento como está
          });

          return combineLatest(enrichedElements$); // Espera todos los observables para combinarlos
        })
      );
    });
  }

  getFilteredElementsToPractice(
    filters: Record<string, any> = {},
    options: {
      pageSize?: number;
      startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
    } = {}
  ): Observable<any[]> {

    return runInInjectionContext(this.injector, () => {
      // console.log({ filters: {...filters} });
      const elementsRef = collection(
        this.firestore,
        DbCollections.elementsToPractice
      ) as CollectionReference<IElementToPractice>;

      function extractValidFilters(obj: any, prefix = ''): [string, any][] {
        return Object.entries(obj).flatMap(([key, val]) => {
          if (val === null || val === '') return [];
          if (typeof val === 'object' && !Array.isArray(val)) {
            return extractValidFilters(val, `${prefix}${key}.`);
          }
          return [[`${prefix}${key}`, val]];
        });
      }

      const typeFilter = filters['type'];
      delete filters['type'];

      const validFilters = extractValidFilters(filters);
      console.log({ validFilters });
      const constraints: QueryConstraint[] = [];

      // console.log({ validFilters });

      for (const [path, value] of validFilters) {

        if (path === 'en') {
          constraints.push(where(path, '>=', value));
          constraints.push(where(path, '<=', value + '\uf8ff'));
        } else constraints.push(where(path, '==', value));
      }

      // console.log({ constraints });

      const baseQuery = query(elementsRef, ...constraints);

      if (!typeFilter) return this.executeQuery(baseQuery, options);

      const parents: string[] = [];
      const children: string[] = [];

      const childrenTypes: string[] = [
        typesOfWords.verb,
        typesOfWords.adjective,
        typesOfWords.preposition,
        typesOfWords.adverb,
        typesOfWords.noun,
      ];

      for (const typeId of Array.isArray(typeFilter)
        ? typeFilter
        : [typeFilter]) {
        if (childrenTypes.includes(typeId)) {
          children.push(typeId);
        } else parents.push(typeId);
        // const found = allTypes.find((t) => t.id === typeId);
        // if (!found) continue;
        // if (found.father) {
        //   children.push(typeId);
        // } else {
        //   parents.push(typeId);
        // }
      }

      const parentQuery =
        parents.length > 0
          ? query(baseQuery, where('type', 'in', parents))
          : null;

      const childQuery =
        children.length > 0
          ? query(
            baseQuery,
            where('selectedUses', 'array-contains-any', children)
          )
          : null;

      const observables: Observable<any[]>[] = [];

      if (parentQuery) {
        observables.push(this.executeQuery(parentQuery, options));
      }
      if (childQuery) {
        observables.push(this.executeQuery(childQuery, options));
      }

      if (observables.length === 0) {
        return of([]);
      }

      return combineLatest(observables).pipe(
        map((results) => {
          const merged = [...results.flat()];
          // Quitar duplicados por ID
          const uniqueMap = new Map();
          merged.forEach((el) => uniqueMap.set(el.id, el));
          return Array.from(uniqueMap.values());
        })
      );
    });

  }

  private executeQuery(
    queryRef: Query<IElementToPractice>,
    options: {
      pageSize?: number;
      startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
    }
  ): Observable<any[]> {
    return runInInjectionContext(this.injector, () => {
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
          const enrichedElements$ = elements.map((element) => {
            const wordTypeId = element.verbInfo?.wordType;

            if (wordTypeId) {
              return this._typeSvc.getType(wordTypeId).pipe(
                map((wordTypeData) => ({
                  ...element,
                  verbInfo: {
                    ...element.verbInfo,
                    wordType: wordTypeData,
                  },
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

  async addElementToPractice(data: IElementToPractice): Promise<string> {
    return runInInjectionContext(this.injector, async () => {
      // 1️⃣ Crear una consulta para verificar si ya existe un documento con el mismo valor de "en"
      const q = query(this.elementToPracticesRef, where('en', '==', data.en));
      const existing = await getDocs(q);

      // 2️⃣ Si ya existe, lanzar un error
      if (!existing.empty) {
        this._nzNotificationSvc.info('Basic Form in use', `There is already an Element To Practice which has the value: ${data.en}`);
        throw new Error(`Ya existe un elemento con el valor "en" igual a "${data.en}".`);
      }

      // 3️⃣ Si no existe, agregar el nuevo documento
      const docRef = await addDoc(this.elementToPracticesRef, data);
      return docRef.id;
    });
  }

  // updateElementToPractice(
  //   id: string,
  //   elementToPractice: Partial<IElementToPractice>
  // ) {

  //   return runInInjectionContext(this.injector, async () => {
  //     // const elementToPracticeDoc = doc(this.firestore, `elementToPractices/${id}`);
  //     // 1️⃣ Crear una consulta para verificar si ya existe un documento con el mismo valor de "en"
  //     const q = query(this.elementToPracticesRef, where('en', '==', elementToPractice.en));
  //     const existing = await getDocs(q);

  //     // 2️⃣ Si ya existe, lanzar un error
  //     if (!existing.empty && existing.docs[0].id !== id) {
  //       this._nzNotificationSvc.info('Basic Form in use', `There is already an Element To Practice which has the value: ${elementToPractice.en}`);
  //       throw new Error(`Ya existe un elemento con el valor "en" igual a "${elementToPractice.en}".`);
  //     }

  //     const elementToPracticeDoc = doc(
  //       this.firestore,
  //       `${DbCollections.elementsToPractice}/${id}`
  //     );
  //     return updateDoc(elementToPracticeDoc, elementToPractice);
  //   });
  // }

  async updateElementToPractice2(
    id: string,
    elementToPractice: Partial<IElementToPractice>
  ) {
    return runInInjectionContext(this.injector, async () => {
      // const elementToPracticeDoc = doc(this.firestore, `elementToPractices/${id}`);
      // 1️⃣ Crear una consulta para verificar si ya existe un documento con el mismo valor de "en"
      const q = query(this.elementToPracticesRef, where('en', '==', elementToPractice.en));
      const existing = await getDocs(q);

      // 2️⃣ Si ya existe, lanzar un error
      if (!existing.empty && existing.docs[0].id !== id) {
        this._nzNotificationSvc.info('Basic Form in use', `There is already an Element To Practice which has the value: ${elementToPractice.en}`);
        throw new Error(`Ya existe un elemento con el valor "en" igual a "${elementToPractice.en}".`);
      }
      const elementToPracticeDoc = doc(
        this.firestore,
        `${DbCollections.elementsToPractice}/${id}`
      );
      return await setDoc(elementToPracticeDoc, elementToPractice, {
        merge: false,
      });
    });
  }

  deleteElementToPractice(id: string) {
    return runInInjectionContext(this.injector, () => {
      // const elementToPracticeDoc = doc(this.firestore, `elementToPractices/${id}`);
      const elementToPracticeDoc = doc(
        this.firestore,
        `${DbCollections.elementsToPractice}/${id}`
      );
      return deleteDoc(elementToPracticeDoc);
    });
  }
}
