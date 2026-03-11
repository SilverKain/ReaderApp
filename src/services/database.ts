import type { Book, Folder } from '../types';

/**
 * Abstract database interface.
 * Replace IndexedDBService with FirebaseService to migrate to cloud storage.
 */
export interface DatabaseService {
  initialize(): Promise<void>;

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
