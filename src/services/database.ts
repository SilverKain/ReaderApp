import type { Book, Folder } from '../types';

/**
 * Abstract database interface.
 * Implementations:
 *   - IndexedDBService (offline, local)
 *   - FirestoreService (cloud, real-time sync)
 */
export interface DatabaseService {
  initialize(): Promise<void>;

  /** Subscribe to real-time folder updates. Returns unsubscribe function. */
  subscribeToFolders(callback: (folders: Folder[]) => void): () => void;

  /** Subscribe to real-time book updates. Returns unsubscribe function. */
  subscribeToBooks(callback: (books: Book[]) => void): () => void;

  // Folders
  getFolders(): Promise<Folder[]>;
  saveFolder(folder: Folder): Promise<void>;
  updateFolder(folder: Folder): Promise<void>;
  deleteFolder(id: string): Promise<void>;

  // Books
  getBooks(): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  saveBook(book: Book): Promise<void>;
  updateBook(updates: Partial<Book> & Pick<Book, 'id'>): Promise<void>;
  deleteBook(id: string): Promise<void>;
}
