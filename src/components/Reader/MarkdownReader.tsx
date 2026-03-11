import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { BookOpen, ArrowLeft } from 'lucide-react';
import type { Book } from '../../types';
import { useReadingPosition } from '../../hooks/useReadingPosition';
import { extractHeadings } from '../../utils/helpers';
import { TableOfContents } from './TableOfContents';

interface MarkdownReaderProps {
  book: Book;
  onBack?: () => void;
}

export function MarkdownReader({ book, onBack }: MarkdownReaderProps) {
  const { readerRef, handleScroll, scrollToAnchor } = useReadingPosition(book.id);
  const [progress, setProgress] = useState(0);

  const headings = useMemo(() => extractHeadings(book.content), [book.content]);

  const handleScrollWithProgress = () => {
    handleScroll();
    if (readerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = readerRef.current;
      const total = scrollHeight - clientHeight;
      setProgress(total > 0 ? Math.min(100, Math.round((scrollTop / total) * 100)) : 100);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Reader main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Book header bar */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 sm:px-6 h-12 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 -ml-1 rounded-lg text-gray-500 dark:text-gray-400
                hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <BookOpen size={15} className="text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
          <h1 className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
            {book.title}
          </h1>
          <span className="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500 font-mono">
            {progress}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex-shrink-0 h-0.5 bg-gray-100 dark:bg-gray-700">
          <div
            className="h-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Scrollable content */}
        <div
          ref={readerRef}
          onScroll={handleScrollWithProgress}
          className="flex-1 overflow-y-auto"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
            <article className="prose prose-sm sm:prose-base dark:prose-invert
              prose-headings:font-semibold prose-headings:tracking-tight
              prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
              prose-code:before:content-none prose-code:after:content-none
              prose-code:bg-gray-100 dark:prose-code:bg-gray-700/60
              prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950
              prose-pre:rounded-xl prose-pre:shadow-lg
              prose-blockquote:border-indigo-400 dark:prose-blockquote:border-indigo-500
              prose-blockquote:bg-indigo-50 dark:prose-blockquote:bg-indigo-900/10
              prose-blockquote:rounded-r-lg prose-blockquote:py-1
              prose-a:text-indigo-600 dark:prose-a:text-indigo-400
              prose-table:text-sm
              prose-img:rounded-xl prose-img:shadow-md
              max-w-none"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug, rehypeHighlight]}
              >
                {book.content}
              </ReactMarkdown>
            </article>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <TableOfContents headings={headings} onSelect={scrollToAnchor} />
    </div>
  );
}
