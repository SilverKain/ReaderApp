import { useEffect } from 'react';
import { AppLayout } from './components/Layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './components/Auth/LoginPage';
import { useLibraryStore } from './store/libraryStore';
import { useAuthStore } from './store/authStore';
import { FirestoreService } from './firebase/firestoreService';
import { db } from './firebase/config';
import { BookOpen } from 'lucide-react';

function LoadingScreen({ message = 'Загрузка…' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center gap-3">
        <BookOpen size={32} className="text-indigo-500 animate-pulse" />
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}

export default function App() {
  const { user, isAuthLoading, initAuth } = useAuthStore();
  const { isLoaded, initialize, cleanup } = useLibraryStore();

  // Init Firebase auth listener once on mount
  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When user logs in/out — switch library service
  useEffect(() => {
    if (user && db) {
      const service = new FirestoreService(db, user.uid);
      initialize(service);
    } else if (!isAuthLoading) {
      cleanup();
    }
  }, [user?.uid, isAuthLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isAuthLoading) {
    return <LoadingScreen message="Проверка авторизации…" />;
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!isLoaded) {
    return <LoadingScreen message="Загрузка библиотеки…" />;
  }

  return (
    <AppLayout>
      <HomePage />
    </AppLayout>
  );
}
