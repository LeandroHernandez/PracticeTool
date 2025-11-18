import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
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
  getDoc,
} from '@angular/fire/firestore';
import { combineLatest, from, map, Observable, of, switchMap } from 'rxjs';
import { IModule, IRole, IRoleBody } from '../../../../interfaces';
import { DbCollections, typesOfWords } from '../../../../enums';
import { TypeService } from '../types/types.service';
import { Query, setDoc } from 'firebase/firestore';


@Injectable({
  providedIn: 'root'
})
export class RolesService {
  // private rolesRef: CollectionReference<IRole>;

  // constructor(private firestore: Firestore) {
  //   this.rolesRef = collection(
  //     this.firestore,
  //     DbCollections.roles
  //   ) as CollectionReference<IRole>;
  // }

  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector); // ✅ para asegurar contexto
  private rolesRef = runInInjectionContext(this.injector, () =>
    collection(this.firestore, DbCollections.roles) as CollectionReference<IRole>
  );

  getRoles(): Observable<IRole[]> {
    return runInInjectionContext(this.injector, () => collectionData(this.rolesRef, {
      idField: 'id',
    }) as Observable<IRole[]>);
  }

  getFilteredRoles(
    filters: Record<string, any> = {},
    options: {
      pageSize?: number;
      startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
    } = {}
  ): Observable<IRole[]> {
    return runInInjectionContext(this.injector, () => {

      const rolesRef = collection(
        this.firestore,
        DbCollections.roles
      ) as CollectionReference<IRoleBody>;

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
    });
  }

  // getRole(id: string): Observable<IRole> {
  //   const roleDoc = doc(
  //     this.firestore,
  //     `${DbCollections.roles}/${id}`
  //   );
  //   return docData(roleDoc, {
  //     idField: 'id',
  //   }) as Observable<IRole>;
  // }
  // getRole(id: string, noPopulate?: boolean): Observable<IRole> {
  //   const roleDoc = doc(this.firestore, `${DbCollections.roles}/${id}`);

  //   return docData(roleDoc, { idField: 'id' }).pipe(
  //     switchMap((role: any) => {
  //       if (noPopulate) {
  //         return of(role as IRole);
  //       }
  //       // Si no tiene módulos asignados, devolvemos el rol tal cual
  //       const assigned = role.assignedModules;
  //       console.log({ assigned });
  //       if (!assigned || !Array.isArray(assigned) || assigned.length === 0) {
  //         return of(role as IRole);
  //       }

  //       // Consultamos los módulos cuyos ids estén en 'assigned'
  //       const modulesRef = collection(this.firestore, DbCollections.modules);
  //       const q = query(modulesRef, where('id', 'in', assigned));

  //       return from(getDocs(q)).pipe(
  //         map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as IModule)),
  //         map((modules: IModule[]) => {
  //           console.log({ assignedModules: modules });
  //           return {
  //             ...role,
  //             assignedModules: modules, // reemplazamos los ids por los módulos completos
  //           } as IRole;
  //         })
  //       );
  //     })
  //   );
  // }

  getRole(id: string, noPopulate?: boolean): Observable<IRole> {
    return runInInjectionContext(this.injector, () => {
      const roleDoc = doc(this.firestore, `${DbCollections.roles}/${id}`);

      return docData(roleDoc, { idField: 'id' }).pipe(
        switchMap((role: any) => {
          if (noPopulate) return of(role as IRole);

          // Acepta ambos nombres por si hay inconsistencias
          const assigned: string[] = role.assignedModules || role.asignnedModules;

          if (!assigned || !Array.isArray(assigned) || assigned.length === 0) {
            return of(role as IRole);
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
              ...role,
              assignedModules: modules, // remplaza ids por documentos completos
            } as IRole))
          );
        })
      );
    });
  }

  async addRole(data: IRoleBody | any): Promise<string> {
    return runInInjectionContext(this.injector, async () => {
      const docRef = await addDoc(this.rolesRef, data);
      return docRef.id;
    });
  }

  async updateRole(
    id: string,
    role: Partial<IRole>
  ) {
    return runInInjectionContext(this.injector, async () => {
      const roleDoc = doc(
        this.firestore,
        `${DbCollections.roles}/${id}`
      );
      return await setDoc(roleDoc, role, {
        merge: true,
      });
    });
  }

  deleteRole(id: string) {
    return runInInjectionContext(this.injector, () => {
      const roleDoc = doc(
        this.firestore,
        `${DbCollections.roles}/${id}`
      );
      return deleteDoc(roleDoc);
    });
  }
}
