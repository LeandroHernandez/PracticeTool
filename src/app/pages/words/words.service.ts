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
  DocumentData
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { IWord } from '../../interfaces';
import { DbCollections } from '../../constants';

// export interface Word {
//   id?: string;
//   text: string;
//   meaning: string;
// }

@Injectable({
  providedIn: 'root',
})
export class WordService {
  private wordsRef: CollectionReference<IWord>;

  constructor(private firestore: Firestore) {
    this.wordsRef = collection(this.firestore, 'words') as CollectionReference<IWord>;
  }

  getWords(): Observable<IWord[]> {
    return collectionData(this.wordsRef, { idField: 'id' }) as Observable<IWord[]>;
  }

  getWord(id: string): Observable<IWord> {
    const wordDoc = doc(this.firestore, `${DbCollections.words}/${id}`);
    return docData(wordDoc, { idField: 'id' }) as Observable<IWord>;
  }
  
  async getFilteredWords(
    filterData: any, // puede ser null o el objeto dinámico
    pageSize: number = 10,
    startAfterDoc: any = null // puedes pasar el último doc para paginar
  ): Promise<IWord[]> {
    const constraints: QueryConstraint[] = [];

    if (filterData !== null) {
      const flatFilters = this.flattenObject(filterData);
      for (const [key, value] of Object.entries(flatFilters)) {
        if (value !== null && value !== undefined && value !== '') {
          constraints.push(where(key, '==', value));
        }
      }
    }

    // Orden y paginación (asegúrate de tener un campo como 'createdAt' o 'en' para ordenar)
    constraints.push(orderBy('en')); // ajusta al campo por el cual quieras ordenar
    constraints.push(limit(pageSize));

    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
    }

    const q = query(this.wordsRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Convierte un objeto anidado en uno plano con claves tipo 'verbInfo.simplePresent'
   */
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

  addWord(word: IWord) {
    return addDoc(this.wordsRef, word);
  }

  updateWord(id: string, word: Partial<IWord>) {
    const wordDoc = doc(this.firestore, `${DbCollections.words}/${id}`);
    return updateDoc(wordDoc, word);
  }

  deleteWord(id: string) {
    const wordDoc = doc(this.firestore, `${DbCollections.words}/${id}`);
    return deleteDoc(wordDoc);
  }
}
