export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
  isExpanded: boolean;
}

export interface Book {
  id: string;
  title: string;
  folderId: string | null;
  content: string;
  lastReadPosition: number;
  createdAt: number;
  updatedAt: number;
}

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export interface SearchResult {
  book: Book;
  excerpt: string;
}
