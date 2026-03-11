import { openDB, type IDBPDatabase } from 'idb';
import type { DatabaseService } from './database';
import type { Book, Folder } from '../types';

const DB_NAME = 'markdown-library';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (!dbInstance) {
    dbInstance = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('folders')) {
          db.createObjectStore('folders', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('books')) {
          db.createObjectStore('books', { keyPath: 'id' });
        }
      },
    });
  }
  return dbInstance;
}

class IndexedDBService implements DatabaseService {
  async initialize(): Promise<void> {
    await getDB();
  }

  subscribeToFolders(callback: (folders: Folder[]) => void): () => void {
    // IndexedDB has no real-time — fire once with initial data
    this.getFolders().then(callback);
    return () => {};
  }

  subscribeToBooks(callback: (books: Book[]) => void): () => void {
    this.getBooks().then(callback);
    return () => {};
  }

  async getFolders(): Promise<Folder[]> {
    const db = await getDB();
    return db.getAll('folders');
  }

  async saveFolder(folder: Folder): Promise<void> {
    const db = await getDB();
    await db.put('folders', folder);
  }

  async updateFolder(folder: Folder): Promise<void> {
    const db = await getDB();
    await db.put('folders', folder);
  }

  async deleteFolder(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('folders', id);
  }

  async getBooks(): Promise<Book[]> {
    const db = await getDB();
    return db.getAll('books');
  }

  async getBook(id: string): Promise<Book | undefined> {
    const db = await getDB();
    return db.get('books', id);
  }

  async saveBook(book: Book): Promise<void> {
    const db = await getDB();
    await db.put('books', book);
  }

  async updateBook(updates: Partial<Book> & Pick<Book, 'id'>): Promise<void> {
    const db = await getDB();
    const existing = await db.get('books', updates.id);
    if (existing) {
      await db.put('books', { ...existing, ...updates });
    }
  }

  async deleteBook(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('books', id);
  }
}

/**
 * Singleton instance of the database service.
 * To switch to Firebase: replace with `new FirebaseService()`
 */
export const dbService: DatabaseService = new IndexedDBService();
export default dbService;
