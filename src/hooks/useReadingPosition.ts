import { useRef, useCallback, useEffect } from 'react';
import { useLibraryStore } from '../store/libraryStore';

export function useReadingPosition(bookId: string | null) {
  const { books, updateReadingPosition } = useLibraryStore();
  const readerRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRestoredRef = useRef(false);

  const currentBook = books.find(b => b.id === bookId);

  // Restore scroll position when book changes
  useEffect(() => {
    isRestoredRef.current = false;
    if (!readerRef.current || !currentBook) return;

    const timer = setTimeout(() => {
      if (readerRef.current && currentBook.lastReadPosition > 0) {
        readerRef.current.scrollTop = currentBook.lastReadPosition;
      }
      isRestoredRef.current = true;
    }, 150);

    return () => clearTimeout(timer);
  }, [bookId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = useCallback(() => {
    if (!readerRef.current || !bookId || !isRestoredRef.current) return;

    const position = readerRef.current.scrollTop;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      updateReadingPosition(bookId, position);
    }, 500);
  }, [bookId, updateReadingPosition]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const scrollToAnchor = useCallback((id: string) => {
    if (!readerRef.current) return;
    const el = readerRef.current.querySelector(`#${CSS.escape(id)}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const readingProgress = (() => {
    if (!readerRef.current) return 0;
    const { scrollTop, scrollHeight, clientHeight } = readerRef.current;
    const total = scrollHeight - clientHeight;
    if (total <= 0) return 100;
    return Math.min(100, Math.round((scrollTop / total) * 100));
  })();

  return { readerRef, handleScroll, scrollToAnchor, readingProgress };
}
