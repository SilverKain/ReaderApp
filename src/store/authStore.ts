import { create } from 'zustand';
import type { User } from 'firebase/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase/config';

interface AuthStore {
  user: User | null;
  isAuthLoading: boolean;
  authError: string | null;

  initAuth: () => () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthLoading: true,
  authError: null,

  initAuth: () => {
    if (!auth) {
      set({ isAuthLoading: false });
      return () => {};
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, isAuthLoading: false });
    });
    return unsubscribe;
  },

  loginWithEmail: async (email, password) => {
    if (!auth) return;
    try {
      set({ authError: null });
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      set({ authError: getAuthErrorMessage((e as { code: string }).code) });
    }
  },

  registerWithEmail: async (email, password, displayName) => {
    if (!auth) return;
    try {
      set({ authError: null });
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName?.trim()) {
        await updateProfile(cred.user, { displayName: displayName.trim() });
        // Re-trigger auth state update with updated displayName
        set({ user: { ...cred.user, displayName: displayName.trim() } as User });
      }
    } catch (e) {
      set({ authError: getAuthErrorMessage((e as { code: string }).code) });
    }
  },

  loginWithGoogle: async () => {
    if (!auth) return;
    try {
      set({ authError: null });
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      set({ authError: getAuthErrorMessage((e as { code: string }).code) });
    }
  },

  logout: async () => {
    if (!auth) return;
    await signOut(auth);
  },

  clearError: () => set({ authError: null }),
}));

function getAuthErrorMessage(code: string): string {
  const map: Record<string, string> = {
    'auth/invalid-email': 'Неверный формат email',
    'auth/user-not-found': 'Пользователь не найден',
    'auth/wrong-password': 'Неверный пароль',
    'auth/email-already-in-use': 'Этот email уже зарегистрирован',
    'auth/weak-password': 'Пароль слишком простой (минимум 6 символов)',
    'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
    'auth/popup-closed-by-user': 'Вход через Google отменён',
    'auth/invalid-credential': 'Неверный email или пароль',
    'auth/network-request-failed': 'Ошибка сети. Проверьте подключение',
    'auth/operation-not-allowed': 'Этот способ входа не включён',
  };
  return map[code] ?? 'Ошибка авторизации. Попробуйте ещё раз';
}
