import type { ReactNode } from 'react';
import { BookOpen, Upload, FolderPlus } from 'lucide-react';
import { useLibraryStore } from '../store/libraryStore';
import { MarkdownReader } from '../components/Reader/MarkdownReader';

export function HomePage() {
  const { books, currentBookId, setCurrentBook } = useLibraryStore();

  const currentBook = books.find(b => b.id === currentBookId) ?? null;

  if (currentBook) {
    return (
      <div className="h-full">
        <MarkdownReader
          book={currentBook}
          onBack={() => setCurrentBook(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl
          bg-indigo-50 dark:bg-indigo-900/20 mb-5">
          <BookOpen size={36} className="text-indigo-500 dark:text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Добро пожаловать в Library Reader
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
          Загружайте Markdown-книги, организуйте их по папкам и читайте прямо здесь.
          Приложение запоминает место чтения.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <FeatureCard
            icon={<Upload size={18} className="text-indigo-500" />}
            title="Загрузите .md файл"
            desc="Через кнопку в боковой панели"
          />
          <FeatureCard
            icon={<FolderPlus size={18} className="text-amber-500" />}
            title="Создайте папки"
            desc="Организуйте библиотеку"
          />
          <FeatureCard
            icon={<BookOpen size={18} className="text-emerald-500" />}
            title="Читайте"
            desc="Позиция сохраняется автоматически"
          />
        </div>

        {books.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-left">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Недавние книги
            </p>
            <div className="space-y-1">
              {books.slice(-5).reverse().map(book => (
                <button
                  key={book.id}
                  onClick={() => setCurrentBook(book.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                    text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700
                    transition-colors text-left"
                >
                  <BookOpen size={14} className="text-indigo-400 flex-shrink-0" />
                  <span className="truncate">{book.title}</span>
                  {book.lastReadPosition > 0 && (
                    <span className="ml-auto text-xs text-indigo-400 flex-shrink-0">продолжить</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
