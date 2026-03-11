import { useState } from 'react';
import { BookOpen, Mail, Lock, Eye, EyeOff, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { isFirebaseConfigured } from '../../firebase/config';

type Mode = 'login' | 'register';

export function LoginPage() {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, authError, clearError, isAuthLoading } =
    useAuthStore();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m);
    clearError();
    setPassword('');
    setDisplayName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email.trim(), password);
      } else {
        await registerWithEmail(email.trim(), password, displayName);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } finally {
      setGoogleLoading(false);
    }
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle size={40} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
            Firebase не настроен
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Скопируйте <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env.example</code>{' '}
            в <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env.local</code> и заполните
            значения Firebase. Подробности в файле <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env.example</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg mb-4">
            <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Library Reader</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Личная библиотека Markdown-книг</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors
                  ${mode === m
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
              >
                {m === 'login' ? 'Войти' : 'Регистрация'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Error */}
            {authError && (
              <div className="flex items-start gap-2 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{authError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Display name (register only) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Имя (необязательно)
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Ваше имя"
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); clearError(); }}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Пароль {mode === 'register' && <span className="text-gray-400">(минимум 6 символов)</span>}
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); clearError(); }}
                    placeholder="••••••••"
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || isAuthLoading || !email.trim() || !password.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4
                  bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                  text-white text-sm font-semibold rounded-xl
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors shadow-sm"
              >
                {loading
                  ? <Loader2 size={16} className="animate-spin" />
                  : mode === 'login' ? 'Войти' : 'Создать аккаунт'
                }
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400 dark:text-gray-500">или</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={googleLoading || isAuthLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4
                border border-gray-300 dark:border-gray-600 rounded-xl
                bg-white dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700
                text-sm font-medium text-gray-700 dark:text-gray-200
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors"
            >
              {googleLoading
                ? <Loader2 size={16} className="animate-spin text-gray-400" />
                : <GoogleIcon />
              }
              Продолжить с Google
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-5">
          Данные хранятся в вашем Firebase-аккаунте
        </p>
      </div>
    </div>
  );
}

const inputClass =
  'w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 ' +
  'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ' +
  'placeholder-gray-400 dark:placeholder-gray-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent ' +
  'transition-colors';

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
