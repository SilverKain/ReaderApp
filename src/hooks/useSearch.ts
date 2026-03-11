import { useMemo } from 'react';
import { useLibraryStore } from '../store/libraryStore';
import { useUIStore } from '../store/uiStore';
import { getExcerpt } from '../utils/helpers';
import type { SearchResult } from '../types';

export function useSearch(): { results: SearchResult[]; query: string } {
  const { books } = useLibraryStore();
  const { searchQuery } = useUIStore();

  const results = useMemo<SearchResult[]>(() => {
    const query = searchQuery.trim();
    if (!query) return [];
    const lower = query.toLowerCase();
    return books
      .filter(
        b =>
          b.title.toLowerCase().includes(lower) ||
          b.content.toLowerCase().includes(lower)
      )
      .map(book => ({
        book,
        excerpt: getExcerpt(book.content, query),
      }));
  }, [books, searchQuery]);

  return { results, query: searchQuery };
}
