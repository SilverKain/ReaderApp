import { useState } from 'react';
import { List, X, ChevronRight } from 'lucide-react';
import type { HeadingItem } from '../../types';

interface TableOfContentsProps {
  headings: HeadingItem[];
  onSelect: (id: string) => void;
}

export function TableOfContents({ headings, onSelect }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (headings.length === 0) return null;

  return (
    <>
      {/* Desktop: sidebar panel */}
      <aside className="hidden xl:flex flex-col w-60 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Содержание
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <TocList headings={headings} onSelect={onSelect} />
        </nav>
      </aside>

      {/* Mobile/Tablet: floating button + panel */}
      <div className="xl:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-30 flex items-center gap-1.5
            bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium
            px-3 py-2 rounded-full shadow-lg transition-colors"
          title="Содержание"
        >
          <List size={16} />
          <span className="hidden sm:inline">Содержание</span>
        </button>

        {/* Drawer overlay */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setIsOpen(false)}
            />
            <div className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Содержание
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-2">
                <TocList
                  headings={headings}
                  onSelect={(id) => { onSelect(id); setIsOpen(false); }}
                />
              </nav>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function TocList({ headings, onSelect }: { headings: HeadingItem[]; onSelect: (id: string) => void }) {
  return (
    <ul className="space-y-0.5">
      {headings.map((h, i) => (
        <li key={`${h.id}-${i}`}>
          <button
            onClick={() => onSelect(h.id)}
            className="w-full text-left flex items-start gap-1 py-1 px-2 rounded-md
              text-xs text-gray-600 dark:text-gray-400
              hover:text-indigo-600 dark:hover:text-indigo-400
              hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
            style={{ paddingLeft: `${8 + (h.level - 1) * 10}px` }}
          >
            {h.level === 1 && (
              <ChevronRight size={10} className="mt-0.5 flex-shrink-0 text-indigo-400" />
            )}
            <span className={h.level === 1 ? 'font-medium text-gray-700 dark:text-gray-300' : ''}>
              {h.text}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
