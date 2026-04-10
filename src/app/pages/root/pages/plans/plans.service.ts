import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  deleteDoc,
  docData,
  CollectionReference,
  query,
  where,
  QueryConstraint,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  collectionSnapshots,
  getDoc,
} from '@angular/fire/firestore';
import { combineLatest, from, map, Observable, of, switchMap } from 'rxjs';
import { IModule, IPlan, IPlanBody } from '../../../../interfaces';
import { DbCollections } from '../../../../enums';
import { setDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class PlansService {

  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector); // ✅ para asegurar contexto
  private PlansRef = runInInjectionContext(this.injector, () =>
    collection(this.firestore, DbCollections.plans) as CollectionReference<IPlan>
  );

  // getPlans(): Observable<IPlan[]> {
  //   return runInInjectionContext(this.injector, () => collectionData(this.PlansRef, {
  //     idField: 'id',
  //   }) as Observable<IPlan[]>);
  // }

  getFilteredPlans(
    filters: Record<string, any> = {},
    options: {
      pageSize?: number;
      startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
    } = {}
  ): Observable<IPlan[]> {
    return runInInjectionContext(this.injector, () => {

      const PlansRef = collection(
        this.firestore,
        DbCollections.plans
      ) as CollectionReference<IPlanBody>;

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

      const baseQuery = query(PlansRef, ...constraints);

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
    });
  }

  getPlan(id: string, noPopulate?: boolean): Observable<IPlan> {
    return runInInjectionContext(this.injector, () => {
      const PlanDoc = doc(this.firestore, `${DbCollections.plans}/${id}`);

      return docData(PlanDoc, { idField: 'id' }).pipe(
        switchMap((Plan: any) => {
          if (noPopulate) return of(Plan as IPlan);

          // Acepta ambos nombres por si hay inconsistencias
          const assigned: string[] = Plan.assignedModules || Plan.asignnedModules;

          if (!assigned || !Array.isArray(assigned) || assigned.length === 0) {
            return of(Plan as IPlan);
          }

          // Creamos un array de promesas que traen cada módulo por su document id
          const modulePromises = assigned.map((moduleId: string) => {
            return runInInjectionContext(this.injector, () => {
              const moduleDocRef = doc(this.firestore, `${DbCollections.modules}/${moduleId}`);
              return getDoc(moduleDocRef).then((snapshot: any) => {
                if (!snapshot.exists()) return null;
                return { id: snapshot.id, ...(snapshot.data() as any) } as IModule;
              });
            });
          });

          // from(Promise.all(...)) convierte la promesa en un Observable
          return from(Promise.all(modulePromises)).pipe(
            map(mods => (mods.filter(Boolean) as IModule[])), // filtra nulos
            map((modules: IModule[]) => ({
              ...Plan,
              assignedModules: modules, // remplaza ids por documentos completos
            } as IPlan))
          );
        })
      );
    });
  }

  async addPlan(data: IPlanBody | any): Promise<string> {
    return runInInjectionContext(this.injector, async () => {
      const docRef = await addDoc(this.PlansRef, data);
      return docRef.id;
    });
  }

  async updatePlan(
    id: string,
    Plan: Partial<IPlan>
  ) {
    return runInInjectionContext(this.injector, async () => {
      const PlanDoc = doc(
        this.firestore,
        `${DbCollections.plans}/${id}`
      );
      return await setDoc(PlanDoc, Plan, {
        merge: true,
      });
    });
  }

  deletePlan(id: string) {
    return runInInjectionContext(this.injector, () => {
      const PlanDoc = doc(
        this.firestore,
        `${DbCollections.plans}/${id}`
      );
      return deleteDoc(PlanDoc);
    });
  }
}
