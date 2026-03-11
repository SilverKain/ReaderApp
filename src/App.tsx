import { useEffect } from 'react';
import { AppLayout } from './components/Layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { useLibraryStore } from './store/libraryStore';

export default function App() {
  const { initialize, isLoaded } = useLibraryStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Загрузка библиотеки…</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <HomePage />
    </AppLayout>
  );
}
