import { Search, X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useUIStore();

  return (
    <div className="relative">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
      />
      <input
        type="text"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Поиск по библиотеке…"
        className="w-full pl-8 pr-7 py-2 text-sm rounded-lg
          bg-gray-100 dark:bg-gray-700/60
          text-gray-900 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-500
          border border-transparent focus:border-indigo-400 dark:focus:border-indigo-500
          focus:bg-white dark:focus:bg-gray-700
          focus:outline-none transition-colors"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
