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
import { IModule, TModule } from '../../../../interfaces';
import { DbCollections, typesOfWords } from '../../../../enums';
import { TypeService } from '../types/types.service';
import { Query, setDoc } from 'firebase/firestore';


@Injectable({
  providedIn: 'root'
})
export class ModulesService {
  private modulesRef: CollectionReference<IModule>;

  constructor(private firestore: Firestore) {
    this.modulesRef = collection(
      this.firestore,
      DbCollections.modules
    ) as CollectionReference<IModule>;
  }

  getModules(): Observable<IModule[]> {
    return collectionData(this.modulesRef, {
      idField: 'id',
    }) as Observable<IModule[]>;
  }

  getFilteredModules(
    filters: Record<string, any> = {},
    options: {
      pageSize?: number;
      startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
    } = {}
  ): Observable<IModule[]> {

    const modulesRef = collection(
      this.firestore,
      DbCollections.modules
    ) as CollectionReference<TModule>;

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

    const baseQuery = query(modulesRef, ...constraints);

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

  getModule(id: string): Observable<IModule> {
    const moduleDoc = doc(
      this.firestore,
      `${DbCollections.modules}/${id}`
    );
    return docData(moduleDoc, {
      idField: 'id',
    }) as Observable<IModule>;
  }

  async addModule(data: IModule | any): Promise<string> {
    const docRef = await addDoc(this.modulesRef, data);
    return docRef.id;
  }

  async updateModule(
    id: string,
    module: Partial<IModule>
  ) {
    const moduleDoc = doc(
      this.firestore,
      `${DbCollections.modules}/${id}`
    );
    return await setDoc(moduleDoc, module, {
      merge: true,
    });
  }

  deleteModule(id: string) {
    const moduleDoc = doc(
      this.firestore,
      `${DbCollections.modules}/${id}`
    );
    return deleteDoc(moduleDoc);
  }
}
