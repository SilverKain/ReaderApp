import { create } from 'zustand';
import type { Book, Folder } from '../types';
import dbService from '../services/storage';
import { generateId } from '../utils/helpers';

interface LibraryStore {
  folders: Folder[];
  books: Book[];
  currentBookId: string | null;
  isLoaded: boolean;

  initialize: () => Promise<void>;

  // Folder actions
  addFolder: (name: string, parentId?: string | null) => Promise<void>;
  renameFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  toggleFolderExpanded: (id: string) => void;

  // Book actions
  uploadBook: (file: File, folderId?: string | null) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  moveBook: (bookId: string, folderId: string | null) => Promise<void>;
  setCurrentBook: (id: string | null) => void;
  updateReadingPosition: (bookId: string, position: number) => Promise<void>;
  renameBook: (id: string, title: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  folders: [],
  books: [],
  currentBookId: null,
  isLoaded: false,

  initialize: async () => {
    await dbService.initialize();
    const [folders, books] = await Promise.all([
      dbService.getFolders(),
      dbService.getBooks(),
    ]);
    set({ folders, books, isLoaded: true });
  },

  addFolder: async (name, parentId = null) => {
    const folder: Folder = {
      id: generateId(),
      name,
      parentId,
      createdAt: Date.now(),
      isExpanded: true,
    };
    await dbService.saveFolder(folder);
    set(state => ({ folders: [...state.folders, folder] }));
  },

  renameFolder: async (id, name) => {
    const folder = get().folders.find(f => f.id === id);
    if (!folder) return;
    const updated = { ...folder, name };
    await dbService.updateFolder(updated);
    set(state => ({
      folders: state.folders.map(f => f.id === id ? updated : f),
    }));
  },

  deleteFolder: async (id) => {
    const getAllDescendants = (folderId: string): string[] => {
      const children = get().folders.filter(f => f.parentId === folderId);
      return [folderId, ...children.flatMap(c => getAllDescendants(c.id))];
    };

    const folderIds = new Set(getAllDescendants(id));
    const booksToDelete = get().books.filter(
      b => b.folderId !== null && folderIds.has(b.folderId)
    );
    const bookIdsToDelete = new Set(booksToDelete.map(b => b.id));

    await Promise.all([
      ...[...folderIds].map(fid => dbService.deleteFolder(fid)),
      ...booksToDelete.map(b => dbService.deleteBook(b.id)),
    ]);

    set(state => ({
      folders: state.folders.filter(f => !folderIds.has(f.id)),
      books: state.books.filter(b => !bookIdsToDelete.has(b.id)),
      currentBookId:
        state.currentBookId && bookIdsToDelete.has(state.currentBookId)
          ? null
          : state.currentBookId,
    }));
  },

  toggleFolderExpanded: (id) => {
    set(state => {
      const updatedFolders = state.folders.map(f =>
        f.id === id ? { ...f, isExpanded: !f.isExpanded } : f
      );
      const updatedFolder = updatedFolders.find(f => f.id === id);
      if (updatedFolder) {
        dbService.updateFolder(updatedFolder);
      }
      return { folders: updatedFolders };
    });
  },

  uploadBook: async (file, folderId = null) => {
    const content = await file.text();
    const title = file.name.replace(/\.md$/i, '');
    const book: Book = {
      id: generateId(),
      title,
      folderId,
      content,
      lastReadPosition: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await dbService.saveBook(book);
    set(state => ({ books: [...state.books, book] }));
  },

  deleteBook: async (id) => {
    await dbService.deleteBook(id);
    set(state => ({
      books: state.books.filter(b => b.id !== id),
      currentBookId: state.currentBookId === id ? null : state.currentBookId,
    }));
  },

  moveBook: async (bookId, folderId) => {
    await dbService.updateBook({ id: bookId, folderId, updatedAt: Date.now() });
    set(state => ({
      books: state.books.map(b =>
        b.id === bookId ? { ...b, folderId, updatedAt: Date.now() } : b
      ),
    }));
  },

  setCurrentBook: (id) => {
    set({ currentBookId: id });
  },

  updateReadingPosition: async (bookId, position) => {
    await dbService.updateBook({ id: bookId, lastReadPosition: position });
    set(state => ({
      books: state.books.map(b =>
        b.id === bookId ? { ...b, lastReadPosition: position } : b
      ),
    }));
  },

  renameBook: async (id, title) => {
    await dbService.updateBook({ id, title, updatedAt: Date.now() });
    set(state => ({
      books: state.books.map(b =>
        b.id === id ? { ...b, title, updatedAt: Date.now() } : b
      ),
    }));
  },
}));
