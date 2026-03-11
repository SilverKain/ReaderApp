import { useState } from 'react';
import {
  BookOpen,
  FolderPlus,
  Moon,
  Sun,
  Search,
  X,
} from 'lucide-react';
import { useLibraryStore } from '../../store/libraryStore';
import { useUIStore } from '../../store/uiStore';
import { useSearch } from '../../hooks/useSearch';
import { FolderTree } from './FolderTree';
import { UploadButton } from './UploadButton';
import { SearchBar } from '../UI/SearchBar';
import { Modal, ModalInputForm } from '../UI/Modal';

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { books, folders, addFolder, setCurrentBook } = useLibraryStore();
  const { toggleDarkMode, isDarkMode, searchQuery } = useUIStore();
  const { results } = useSearch();

  const [addingFolder, setAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleBookSelect = (id: string) => {
    setCurrentBook(id);
    onNavigate?.();
  };

  const handleAddFolder = async () => {
    if (newFolderName.trim()) {
      await addFolder(newFolderName.trim(), null);
    }
    setNewFolderName('');
    setAddingFolder(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <BookOpen size={18} />
            <span className="font-bold text-sm tracking-wide">Library Reader</span>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Переключить тему"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Search */}
        <SearchBar />
      </div>

      {/* Search results */}
      {searchQuery.trim() ? (
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {results.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-400 dark:text-gray-600">
              <Search size={28} className="mb-2 opacity-40" />
              <p className="text-sm">Ничего не найдено</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 px-1">
                Найдено: {results.length}
              </p>
              {results.map(({ book, excerpt }) => (
                <button
                  key={book.id}
                  onClick={() => handleBookSelect(book.id)}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {book.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                    {excerpt}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Library tree */}
          <div className="flex-1 overflow-y-auto px-2 pb-3">
            {books.length === 0 && folders.length === 0 ? (
              <div className="flex flex-col items-center py-10 px-4 text-center">
                <BookOpen size={36} className="text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Библиотека пуста
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-600">
                  Загрузите .md файлы или создайте папку
                </p>
              </div>
            ) : (
              <FolderTree onBookSelect={handleBookSelect} />
            )}
          </div>

          {/* Stats bar */}
          {(books.length > 0 || folders.length > 0) && (
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <p className="text-xs text-gray-400 dark:text-gray-600">
                {books.length} {pluralBooks(books.length)} · {folders.length}{' '}
                {pluralFolders(folders.length)}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 space-y-2">
            <UploadButton />
            <button
              onClick={() => {
                setNewFolderName('');
                setAddingFolder(true);
              }}
              className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg
                text-sm font-medium border border-gray-300 dark:border-gray-600
                text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50
                transition-colors"
            >
              <FolderPlus size={15} />
              Создать папку
            </button>
          </div>
        </>
      )}

      {/* Add folder modal */}
      <Modal isOpen={addingFolder} onClose={() => setAddingFolder(false)} title="Новая папка">
        <ModalInputForm
          label="Название папки"
          value={newFolderName}
          onChange={setNewFolderName}
          onSubmit={handleAddFolder}
          onCancel={() => setAddingFolder(false)}
          submitLabel="Создать"
          placeholder="Например: Программирование"
        />
      </Modal>
    </div>
  );
}

function pluralBooks(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'книга';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'книги';
  return 'книг';
}

function pluralFolders(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'папка';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'папки';
  return 'папок';
}
