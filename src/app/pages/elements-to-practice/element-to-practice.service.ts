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
  collectionSnapshots
} from '@angular/fire/firestore';
import { combineLatest, from, map, Observable, of, switchMap } from 'rxjs';
import { IElementToPractice } from '../../interfaces';
import { DbCollections } from '../../constants';
import { TypeService } from '../types/types.service';

@Injectable({
  providedIn: 'root',
})
export class ElementToPracticeService {
  private elementToPracticesRef: CollectionReference<IElementToPractice>;

  constructor(private firestore: Firestore, private _typeSvc: TypeService) {
    this.elementToPracticesRef = collection(this.firestore, DbCollections.elementsToPractice) as CollectionReference<IElementToPractice>;
  }

  getElementsToPractice(typeId?: string): Observable<IElementToPractice[]> {
    if (typeId) {
      return this.getElementsToPracticeByType(typeId);
    }
    return collectionData(this.elementToPracticesRef, { idField: 'id' }) as Observable<IElementToPractice[]>;
  }

  getElementToPractice(id: string): Observable<IElementToPractice> {
    // const elementToPracticeDoc = doc(this.firestore, `elementToPractices/${id}`);
    const elementToPracticeDoc = doc(this.firestore, `${DbCollections.elementsToPractice}/${id}`);
    return docData(elementToPracticeDoc, { idField: 'id' }) as Observable<IElementToPractice>;
  }
  
  // getElementsToPracticeByType(typeId: string): Observable<any[]> {
  //   const ElementsToPracticeRef = collection(this.firestore, DbCollections.elementsToPractice);
  //   const ElementsToPracticeQuery = query(ElementsToPracticeRef, where('type', '==', typeId));
  //   return collectionData(ElementsToPracticeQuery, { idField: 'id' });
  // }

  getElementsToPracticeByType(typeId: string): Observable<any[]> {
    const ElementsToPracticeRef = collection(this.firestore, DbCollections.elementsToPractice);
    const ElementsToPracticeQuery = query(ElementsToPracticeRef, where('type', '==', typeId));
  
    return collectionData(ElementsToPracticeQuery, { idField: 'id' }).pipe(
      switchMap((elements: any[]) => {
        const enrichedElements$ = elements.map(element => {
          const wordTypeId = element.verbInfo?.wordType;
  
          if (wordTypeId) {
            return this._typeSvc.getType(wordTypeId).pipe(
              map(wordTypeData => {
                return {
                  ...element,
                  verbInfo: {
                    ...element.verbInfo,
                    wordType: wordTypeData  // Aquí reemplazas el ID por el objeto
                  }
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

  // getFilteredElementsToPractice(
  //   filters: Record<string, any> = {},
  //   options: {
  //     pageSize?: number;
  //     startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
  //   } = {}
  // ): Observable<any[]> {
  //   // const elementsRef = collection(this.firestore, 'elementsToPractice');
  //   const elementsRef = collection(this.firestore, DbCollections.elementsToPractice) as CollectionReference<IElementToPractice>;


  //   // Utilidad recursiva para extraer pares [ruta, valor] donde haya valor no nulo/vacío
  //   function extractValidFilters(obj: any, prefix = ''): [string, any][] {
  //     return Object.entries(obj).flatMap(([key, val]) => {
  //       if (val === null || val === '') return [];
  //       if (typeof val === 'object' && !Array.isArray(val)) {
  //         return extractValidFilters(val, `${prefix}${key}.`);
  //       }
  //       return [[`${prefix}${key}`, val]];
  //     });
  //   }

  //   const constraints: QueryConstraint[] = [];

  //   // Construir filtros dinámicos (incluyendo 'type' si está presente)
  //   const validFilters = extractValidFilters(filters);
  //   for (const [path, value] of validFilters) {
  //     constraints.push(where(path, '==', value));
  //   }

  //   // Paginación: aplicar límite y cursor si se especifican
  //   if (options.pageSize) {
  //     constraints.push(limit(options.pageSize));
  //   }
  //   if (options.startAfterDoc) {
  //     constraints.push(startAfter(options.startAfterDoc));
  //   }

  //   const filteredQuery = query(elementsRef, ...constraints);

  //   // return from(getDocs(filteredQuery)).pipe(
  //   //   map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  //   // );
  //   return collectionSnapshots(filteredQuery).pipe(
  //     map(snapshot => snapshot.map(doc => ({ id: doc.id, ...doc.data() })))
  //   );
  // }

  getFilteredElementsToPractice(
    filters: Record<string, any> = {},
    options: {
      pageSize?: number;
      startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
    } = {}
  ): Observable<any[]> {
    const elementsRef = collection(this.firestore, DbCollections.elementsToPractice) as CollectionReference<IElementToPractice>;
  
    function extractValidFilters(obj: any, prefix = ''): [string, any][] {
      return Object.entries(obj).flatMap(([key, val]) => {
        if (val === null || val === '') return [];
        if (typeof val === 'object' && !Array.isArray(val)) {
          return extractValidFilters(val, `${prefix}${key}.`);
        }
        return [[`${prefix}${key}`, val]];
      });
    }
  
    const constraints: QueryConstraint[] = [];
  
    const validFilters = extractValidFilters(filters);
    for (const [path, value] of validFilters) {
      constraints.push(where(path, '==', value));
      // constraints.push(where(path, '>=', value));
      // constraints.push(where(path, '<=', value + '\uf8ff'));
    }
  
    if (options.pageSize) {
      constraints.push(limit(options.pageSize));
    }
  
    if (options.startAfterDoc) {
      constraints.push(startAfter(options.startAfterDoc));
    }
  
    const filteredQuery = query(elementsRef, ...constraints);
  
    return collectionSnapshots(filteredQuery).pipe(
      map(snapshot => snapshot.map(doc => ({ id: doc.id, ...doc.data() }))),
      switchMap((elements: any[]) => {
        const enrichedElements$ = elements.map(element => {
          const wordTypeId = element.verbInfo?.wordType;
  
          if (wordTypeId) {
            return this._typeSvc.getType(wordTypeId).pipe(
              map(wordTypeData => ({
                ...element,
                verbInfo: {
                  ...element.verbInfo,
                  wordType: wordTypeData, // Reemplaza el ID por el objeto completo
                },
              }))
            );
          }
  
          return of(element);
        });
  
        return enrichedElements$.length > 0 ? combineLatest(enrichedElements$) : of([]);
      })
    );
  }
  
  
  // addElementToPractice(elementToPractice: IElementToPractice) {
  //   console.log({ elementToPractice })
  //   return addDoc(this.elementToPracticesRef, elementToPractice);
  // }
  async addElementToPractice(data: IElementToPractice): Promise<string> {
    const docRef = await addDoc(this.elementToPracticesRef, data);
    return docRef.id;
  }

  updateElementToPractice(id: string, elementToPractice: Partial<IElementToPractice>) {
    // const elementToPracticeDoc = doc(this.firestore, `elementToPractices/${id}`);
    const elementToPracticeDoc = doc(this.firestore, `${DbCollections.elementsToPractice}/${id}`);
    return updateDoc(elementToPracticeDoc, elementToPractice);
  }

  deleteElementToPractice(id: string) {
    // const elementToPracticeDoc = doc(this.firestore, `elementToPractices/${id}`);
    const elementToPracticeDoc = doc(this.firestore, `${DbCollections.elementsToPractice}/${id}`);
    return deleteDoc(elementToPracticeDoc);
  }
}
