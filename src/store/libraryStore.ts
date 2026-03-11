import { create } from 'zustand';
import type { Book, Folder } from '../types';
import type { DatabaseService } from '../services/database';
import { generateId } from '../utils/helpers';

// Module-level refs: active service + real-time unsubscribe functions
let _svc: DatabaseService | null = null;
let _unsubFolders: (() => void) | null = null;
let _unsubBooks: (() => void) | null = null;
let _foldersReady = false;
let _booksReady = false;

interface LibraryStore {
  folders: Folder[];
  books: Book[];
  currentBookId: string | null;
  isLoaded: boolean;

  initialize: (service: DatabaseService) => void;
  cleanup: () => void;

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

  initialize: (service: DatabaseService) => {
    _unsubFolders?.();
    _unsubBooks?.();
    _foldersReady = false;
    _booksReady = false;
    _svc = service;
    set({ isLoaded: false, folders: [], books: [] });

    _unsubFolders = service.subscribeToFolders((folders) => {
      _foldersReady = true;
      set({ folders, isLoaded: _foldersReady && _booksReady });
    });

    _unsubBooks = service.subscribeToBooks((books) => {
      _booksReady = true;
      set({ books, isLoaded: _foldersReady && _booksReady });
    });
  },

  cleanup: () => {
    _unsubFolders?.();
    _unsubBooks?.();
    _unsubFolders = null;
    _unsubBooks = null;
    _svc = null;
    _foldersReady = false;
    _booksReady = false;
    set({ folders: [], books: [], currentBookId: null, isLoaded: false });
  },

  addFolder: async (name, parentId = null) => {
    if (!_svc) return;
    const folder: Folder = {
      id: generateId(),
      name,
      parentId,
      createdAt: Date.now(),
      isExpanded: true,
    };
    await _svc.saveFolder(folder);
    set(state => ({ folders: [...state.folders, folder] }));
  },

  renameFolder: async (id, name) => {
    if (!_svc) return;
    const folder = get().folders.find(f => f.id === id);
    if (!folder) return;
    const updated = { ...folder, name };
    await _svc.updateFolder(updated);
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

    if (!_svc) return;
    await Promise.all([
      ...[...folderIds].map(fid => _svc!.deleteFolder(fid)),
      ...booksToDelete.map(b => _svc!.deleteBook(b.id)),
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
      if (updatedFolder && _svc) {
        _svc.updateFolder(updatedFolder);
      }
      return { folders: updatedFolders };
    });
  },

  uploadBook: async (file, folderId = null) => {
    if (!_svc) return;
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
    await _svc.saveBook(book);
    set(state => ({ books: [...state.books, book] }));
  },

  deleteBook: async (id) => {
    if (!_svc) return;
    await _svc.deleteBook(id);
    set(state => ({
      books: state.books.filter(b => b.id !== id),
      currentBookId: state.currentBookId === id ? null : state.currentBookId,
    }));
  },

  moveBook: async (bookId, folderId) => {
    if (!_svc) return;
    await _svc.updateBook({ id: bookId, folderId, updatedAt: Date.now() });
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
    if (!_svc) return;
    await _svc.updateBook({ id: bookId, lastReadPosition: position });
    set(state => ({
      books: state.books.map(b =>
        b.id === bookId ? { ...b, lastReadPosition: position } : b
      ),
    }));
  },

  renameBook: async (id, title) => {
    if (!_svc) return;
    await _svc.updateBook({ id, title, updatedAt: Date.now() });
    set(state => ({
      books: state.books.map(b =>
        b.id === id ? { ...b, title, updatedAt: Date.now() } : b
      ),
    }));
  },
}));
