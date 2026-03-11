import { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function UserMenu() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!user) return null;

  const displayName = user.displayName || user.email || '—';
  const email = user.email || '';
  const initial = (user.displayName?.[0] || user.email?.[0] || '?').toUpperCase();

  // Generate consistent color from email
  const colors = [
    'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-rose-500',
    'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-teal-500',
  ];
  const colorIdx = email.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  const avatarColor = colors[colorIdx];

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl
          hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors group"
      >
        {/* Avatar */}
        <div className={`w-7 h-7 rounded-full ${avatarColor} flex items-center justify-center flex-shrink-0`}>
          <span className="text-xs font-bold text-white">{initial}</span>
        </div>

        {/* Name / email */}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate leading-tight">
            {user.displayName || 'Аккаунт'}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate leading-tight">
            {email}
          </p>
        </div>

        <ChevronDown
          size={13}
          className={`flex-shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-800
          rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20">
          {/* User info header */}
          <div className="px-3 py-3 border-b border-gray-100 dark:border-gray-700/60">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center flex-shrink-0`}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-white">{initial}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{email}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-1">
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                transition-colors"
            >
              <LogOut size={14} />
              Выйти из аккаунта
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Compact user badge for mobile header */
export function UserAvatar({ onClick }: { onClick?: () => void }) {
  const { user } = useAuthStore();
  if (!user) return null;

  const email = user.email || '';
  const initial = (user.displayName?.[0] || email[0] || '?').toUpperCase();
  const colors = [
    'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-rose-500',
    'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-teal-500',
  ];
  const colorIdx = email.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;

  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-full ${colors[colorIdx]} flex items-center justify-center flex-shrink-0`}
      title={user.displayName || email}
    >
      {user.photoURL ? (
        <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
      ) : (
        <span className="text-sm font-bold text-white">{initial}</span>
      )}
    </button>
  );
}
