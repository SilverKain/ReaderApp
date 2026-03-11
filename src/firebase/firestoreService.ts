import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  type Firestore,
} from 'firebase/firestore';
import type { DatabaseService } from '../services/database';
import type { Book, Folder } from '../types';

export class FirestoreService implements DatabaseService {
  private db: Firestore;
  private uid: string;

  constructor(db: Firestore, uid: string) {
    this.db = db;
    this.uid = uid;
  }

  private foldersCol() {
    return collection(this.db, 'users', this.uid, 'folders');
  }

  private booksCol() {
    return collection(this.db, 'users', this.uid, 'books');
  }

  async initialize(): Promise<void> {
    // Firestore is always ready
  }

  subscribeToFolders(callback: (folders: Folder[]) => void): () => void {
    return onSnapshot(this.foldersCol(), (snap) => {
      const folders = snap.docs.map(d => d.data() as Folder);
      callback(folders);
    });
  }

  subscribeToBooks(callback: (books: Book[]) => void): () => void {
    return onSnapshot(this.booksCol(), (snap) => {
      const books = snap.docs.map(d => d.data() as Book);
      callback(books);
    });
  }

  async getFolders(): Promise<Folder[]> {
    const snap = await import('firebase/firestore').then(({ getDocs }) => getDocs(this.foldersCol()));
    return snap.docs.map(d => d.data() as Folder);
  }

  async saveFolder(folder: Folder): Promise<void> {
    await setDoc(doc(this.foldersCol(), folder.id), folder);
  }

  async updateFolder(folder: Folder): Promise<void> {
    await setDoc(doc(this.foldersCol(), folder.id), folder, { merge: true });
  }

  async deleteFolder(id: string): Promise<void> {
    await deleteDoc(doc(this.foldersCol(), id));
  }

  async getBooks(): Promise<Book[]> {
    const snap = await import('firebase/firestore').then(({ getDocs }) => getDocs(this.booksCol()));
    return snap.docs.map(d => d.data() as Book);
  }

  async getBook(id: string): Promise<Book | undefined> {
    const snap = await getDoc(doc(this.booksCol(), id));
    return snap.exists() ? (snap.data() as Book) : undefined;
  }

  async saveBook(book: Book): Promise<void> {
    await setDoc(doc(this.booksCol(), book.id), book);
  }

  async updateBook(updates: Partial<Book> & Pick<Book, 'id'>): Promise<void> {
    const { id, ...data } = updates;
    if (Object.keys(data).length > 0) {
      await setDoc(doc(this.booksCol(), id), data, { merge: true });
    }
  }

  async deleteBook(id: string): Promise<void> {
    await deleteDoc(doc(this.booksCol(), id));
  }
}
