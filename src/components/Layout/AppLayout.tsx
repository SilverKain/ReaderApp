import React from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import { MobileDrawer } from '../MobileDrawer/MobileDrawer';
import { useUIStore } from '../../store/uiStore';
import { useTheme } from '../../hooks/useTheme';
import { BookOpen, Moon, Sun, Menu } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isMobileDrawerOpen, setMobileDrawerOpen, toggleDarkMode } = useUIStore();
  const { isDarkMode } = useTheme();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-shrink-0 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <Sidebar />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between h-14 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 -ml-1 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Открыть меню"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <BookOpen size={18} />
            <span className="font-semibold text-sm">Library Reader</span>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-2 -mr-1 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Переключить тему"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />
    </div>
  );
}
