import {
  QueryDocumentSnapshot,
  DocumentData,
} from '@angular/fire/firestore';

// export interface IPageTableInfo {
//     index: number;
//     size: number;
// }

export interface IPageTableInfo {
  pageSize?: number;
  startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
}