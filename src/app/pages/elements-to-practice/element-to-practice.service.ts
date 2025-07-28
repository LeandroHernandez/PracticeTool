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
import { IElementToPractice, IElementToPractice2 } from '../../interfaces';
import { DbCollections, typesOfWords } from '../../constants';
import { TypeService } from '../types/types.service';
import { Query, setDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class ElementToPracticeService {
  private elementToPracticesRef: CollectionReference<IElementToPractice>;

  constructor(private firestore: Firestore, private _typeSvc: TypeService) {
    this.elementToPracticesRef = collection(
      this.firestore,
      DbCollections.elementsToPractice
    ) as CollectionReference<IElementToPractice>;
  }

  getElementsToPractice(typeId?: string): Observable<IElementToPractice[]> {
    if (typeId) {
      return this.getElementsToPracticeByType(typeId);
    }
    return collectionData(this.elementToPracticesRef, {
      idField: 'id',
    }) as Observable<IElementToPractice[]>;
  }

  getElementToPractice(id: string): Observable<IElementToPractice> {
    // const elementToPracticeDoc = doc(this.firestore, `elementToPractices/${id}`);
    const elementToPracticeDoc = doc(
      this.firestore,
      `${DbCollections.elementsToPractice}/${id}`
    );
    return docData(elementToPracticeDoc, {
      idField: 'id',
    }) as Observable<IElementToPractice>;
  }

  // getElementsToPracticeByType(typeId: string): Observable<any[]> {
  //   const ElementsToPracticeRef = collection(this.firestore, DbCollections.elementsToPractice);
  //   const ElementsToPracticeQuery = query(ElementsToPracticeRef, where('type', '==', typeId));
  //   return collectionData(ElementsToPracticeQuery, { idField: 'id' });
  // }

  getElementsToPracticeByType(typeId: string): Observable<any[]> {
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
  }

  getFilteredElementsToPractice(
    filters: Record<string, any> = {},
    options: {
      pageSize?: number;
      startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
    } = {}
  ): Observable<any[]> {
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
    const constraints: QueryConstraint[] = [];


    console.log({ validFilters });

    for (const [path, value] of validFilters) {

      // const condition: boolean = path === 'type' && Array.isArray(value);
      // const condition2: boolean = condition && value.some((val: string) => childrenTypes.includes(val));

      // if ( condition2 ) 
      //   constraints.push(
      //     where(
      //       'selectedUses', 
      //       'array-contains-any', 
      //       value.filter((val: string) => childrenTypes.includes(val))
      //     )
      //   );

      // if (!condition || value.some((val: string) => !childrenTypes.includes(val))) constraints.push(where(path, condition ? 'in' : '==', condition2 ? value.filter((val: string) => !childrenTypes.includes(val)) : value));

      constraints.push(where(path, '==', value));
      // constraints.push(where(path, '>=', value));
      // constraints.push(where(path, '<=', value + '\uf8ff'));
    }

    console.log({ constraints });
    
    const baseQuery = query(elementsRef, ...constraints);
    
    if (!typeFilter) return this.executeQuery(baseQuery, options);
    
    const parents: string[] = [];
    const children: string[] = [];

    const childrenTypes: string[] = [
      typesOfWords.verb,
      typesOfWords.adjective,
      typesOfWords.preposition,
      typesOfWords.adverb,
      typesOfWords.noun
    ]

    for (const typeId of Array.isArray(typeFilter) ? typeFilter : [typeFilter]) {
      if ( childrenTypes.includes(typeId) ) {children.push(typeId)} else parents.push(typeId);
      // const found = allTypes.find((t) => t.id === typeId);
      // if (!found) continue;
      // if (found.father) {
      //   children.push(typeId);
      // } else {
      //   parents.push(typeId);
      // }
    }

      const parentQuery = parents.length > 0
        ? query(baseQuery, where('type', 'in', parents))
        : null;

      const childQuery = children.length > 0
        ? query(baseQuery, where('selectedUses', 'array-contains-any', children))
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
    
    
    // if (options.pageSize) {
    //   constraints.push(limit(options.pageSize));
    // }

    // if (options.startAfterDoc) {
    //   constraints.push(startAfter(options.startAfterDoc));
    // }

    // const filteredQuery = query(elementsRef, ...constraints);

    // return collectionSnapshots(filteredQuery).pipe(
    //   map((snapshot) => snapshot.map((doc) => ({ id: doc.id, ...doc.data() }))),
    //   switchMap((elements: any[]) => {
    //     const enrichedElements$ = elements.map((element) => {
    //       const wordTypeId = element.verbInfo?.wordType;

    //       if (wordTypeId) {
    //         return this._typeSvc.getType(wordTypeId).pipe(
    //           map((wordTypeData) => ({
    //             ...element,
    //             verbInfo: {
    //               ...element.verbInfo,
    //               wordType: wordTypeData, // Reemplaza el ID por el objeto completo
    //             },
    //           }))
    //         );
    //       }

    //       return of(element);
    //     });

    //     return enrichedElements$.length > 0
    //       ? combineLatest(enrichedElements$)
    //       : of([]);
    //   })
    // );
  }
  
private executeQuery(
  queryRef: Query<IElementToPractice>,
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
}

  async addElementToPractice(data: IElementToPractice | any): Promise<string> {
    const docRef = await addDoc(this.elementToPracticesRef, data);
    return docRef.id;
  }

  updateElementToPractice(
    id: string,
    elementToPractice: Partial<IElementToPractice>
  ) {
    // const elementToPracticeDoc = doc(this.firestore, `elementToPractices/${id}`);
    const elementToPracticeDoc = doc(
      this.firestore,
      `${DbCollections.elementsToPractice}/${id}`
    );
    return updateDoc(elementToPracticeDoc, elementToPractice);
  }

  async updateElementToPractice2(
    id: string,
    elementToPractice: Partial<IElementToPractice2>
  ) {
    // const elementToPracticeDoc = doc(this.firestore, `elementToPractices/${id}`);
    const elementToPracticeDoc = doc(
      this.firestore,
      `${DbCollections.elementsToPractice}/${id}`
    );
    return await setDoc(elementToPracticeDoc, elementToPractice, {
      merge: false,
    });
  }

  deleteElementToPractice(id: string) {
    // const elementToPracticeDoc = doc(this.firestore, `elementToPractices/${id}`);
    const elementToPracticeDoc = doc(
      this.firestore,
      `${DbCollections.elementsToPractice}/${id}`
    );
    return deleteDoc(elementToPracticeDoc);
  }
}
