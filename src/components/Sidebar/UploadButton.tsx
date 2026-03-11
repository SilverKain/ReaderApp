import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { useLibraryStore } from '../../store/libraryStore';

interface UploadButtonProps {
  folderId?: string | null;
  compact?: boolean;
}

export function UploadButton({ folderId = null, compact = false }: UploadButtonProps) {
  const { uploadBook } = useLibraryStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setLoading(true);
    try {
      await Promise.all(files.map(f => uploadBook(f, folderId)));
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".md,text/markdown"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className={compact
          ? `flex items-center gap-1.5 text-xs px-2 py-1 rounded-md
             text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30
             disabled:opacity-50 transition-colors`
          : `flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium
             bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
             text-white disabled:opacity-60 transition-colors shadow-sm`
        }
      >
        {loading
          ? <Loader2 size={compact ? 12 : 16} className="animate-spin" />
          : <Upload size={compact ? 12 : 16} />
        }
        {compact ? 'Загрузить' : 'Загрузить книгу (.md)'}
      </button>
    </>
  );
}
