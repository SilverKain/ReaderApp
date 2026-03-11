import { create } from 'zustand';

interface UIStore {
  isMobileDrawerOpen: boolean;
  isDarkMode: boolean;
  searchQuery: string;

  setMobileDrawerOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  setSearchQuery: (query: string) => void;
}

const getInitialDarkMode = (): boolean => {
  const saved = localStorage.getItem('darkMode');
  if (saved !== null) return saved === 'true';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyDarkMode = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Apply dark mode immediately on load
applyDarkMode(getInitialDarkMode());

export const useUIStore = create<UIStore>((set, get) => ({
  isMobileDrawerOpen: false,
  isDarkMode: getInitialDarkMode(),
  searchQuery: '',

  setMobileDrawerOpen: (open) => set({ isMobileDrawerOpen: open }),

  toggleDarkMode: () => {
    const next = !get().isDarkMode;
    localStorage.setItem('darkMode', String(next));
    applyDarkMode(next);
    set({ isDarkMode: next });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
}));
