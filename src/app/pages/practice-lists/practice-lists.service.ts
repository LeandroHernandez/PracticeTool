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
  QueryDocumentSnapshot
} from '@angular/fire/firestore';
import { combineLatest, from, map, Observable, of, switchMap } from 'rxjs';
import { IPracticeList } from '../../interfaces';
import { DbCollections } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class PracticeListsService {
  private practiceListsRef: CollectionReference<IPracticeList>;

  // constructor(private firestore: Firestore, private _typeSvc: TypeService) {
  constructor(private firestore: Firestore) {
    this.practiceListsRef = collection(this.firestore, DbCollections.practiceLists) as CollectionReference<IPracticeList>;
  }

  // getPracticeLists(typeId?: string): Observable<IPracticeList[]> {
  //   if (typeId) {
  //     return this.getPracticeListByType(typeId);
  //   }
  //   return collectionData(this.practiceListsRef, { idField: 'id' }) as Observable<IPracticeList[]>;
  // }
  getPracticeLists(typeId?: string): Observable<any[]> {
  const base$ = typeId
    ? this.getPracticeListByType(typeId)
    : collectionData(this.practiceListsRef, { idField: 'id' }) as Observable<IPracticeList[]>;

  return base$.pipe(
    switchMap((lists: IPracticeList[]) => {
      const enrichedLists$ = lists.map((list) => {
        if (!list.list || list.list.length === 0) {
          return of({ ...list, list: [] }); // Si la lista está vacía
        }

        const elementRefs = list.list.map((id) =>
          doc(this.firestore, DbCollections.elementsToPractice, id)
        );

        const elements$ = combineLatest(
          elementRefs.map((ref) => docData(ref, { idField: 'id' }))
        );

        return elements$.pipe(
          map((elements) => ({
            ...list,
            list: elements, // reemplaza los IDs con los documentos completos
          }))
        );
      });

      return enrichedLists$.length > 0
        ? combineLatest(enrichedLists$)
        : of([]);
    })
  );
}


  getPracticeList(id: string): Observable<IPracticeList> {
    // const PracticeListDoc = doc(this.firestore, `PracticeLists/${id}`);
    const PracticeListDoc = doc(this.firestore, `${DbCollections.practiceLists}/${id}`);
    return docData(PracticeListDoc, { idField: 'id' }) as Observable<IPracticeList>;
  }
  
  getPracticeListByType(typeId: string): Observable<any[]> {
    const PracticeListRef = collection(this.firestore, DbCollections.practiceLists);
    const PracticeListQuery = query(PracticeListRef, where('type', '==', typeId));
  
    return collectionData(PracticeListQuery, { idField: 'id' }).pipe(
      switchMap((elements: any[]) => {
        const enrichedElements$ = elements.map(element => {
          const wordTypeId = element.verbInfo?.wordType;
  
          // if (wordTypeId) {
          //   return this._typeSvc.getType(wordTypeId).pipe(
          //     map(wordTypeData => {
          //       return {
          //         ...element,
          //         verbInfo: {
          //           ...element.verbInfo,
          //           wordType: wordTypeData  // Aquí reemplazas el ID por el objeto
          //         }
          //       };
          //     })
          //   );
          // }
  
          return of(element); // Si no hay wordType, simplemente regresa el elemento como está
        });
  
        return combineLatest(enrichedElements$); // Espera todos los observables para combinarlos
      })
    );
  }

  
  getFilteredPracticeList(
    filterData: any,
    pageSize: number = 10,
    startAfterDoc: QueryDocumentSnapshot | null = null
  ) {
    const constraints: QueryConstraint[] = [];

    if (filterData !== null) {
      const flatFilters = this.flattenObject(filterData);
      for (const [key, value] of Object.entries(flatFilters)) {
        if (value !== null && value !== undefined && value !== '') {
          constraints.push(where(key, '==', value));
        }
      }
    }

    constraints.push(orderBy('en')); // Cambia a un campo que tengas indexado
    constraints.push(limit(pageSize));

    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
    }

    const q = query(this.practiceListsRef, ...constraints);

    return from(getDocs(q)).pipe(
      switchMap(snapshot => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const enrichedDocs$ = docs.map(element => {
          // const wordTypeId: any = element.verbInfo?.wordType;

          // if (wordTypeId) {
          //   return this._typeSvc.getType(wordTypeId).pipe(
          //     map(wordTypeData => ({
          //       ...element,
          //       verbInfo: {
          //         ...element.verbInfo,
          //         wordType: wordTypeData
          //       }
          //     }))
          //   );
          // }

          return of(element);
        });

        return combineLatest(enrichedDocs$);
      })
    );
  }

  private flattenObject(obj: any, parentKey: string = '', result: any = {}): any {
    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
      const value = obj[key];
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.flattenObject(value, newKey, result);
      } else {
        result[newKey] = value;
      }
    }
    return result;
  }

  
  addPracticeList(PracticeList: IPracticeList) {
    return addDoc(this.practiceListsRef, PracticeList);
  }

  updatePracticeList(id: string, PracticeList: Partial<IPracticeList>) {
    // const PracticeListDoc = doc(this.firestore, `PracticeLists/${id}`);
    const PracticeListDoc = doc(this.firestore, `${DbCollections.practiceLists}/${id}`);
    return updateDoc(PracticeListDoc, PracticeList);
  }

  deletePracticeList(id: string) {
    // const PracticeListDoc = doc(this.firestore, `PracticeLists/${id}`);
    const PracticeListDoc = doc(this.firestore, `${DbCollections.practiceLists}/${id}`);
    return deleteDoc(PracticeListDoc);
  }
}
