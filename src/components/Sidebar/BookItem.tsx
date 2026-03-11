import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { BookOpen, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { Book } from '../../types';
import { useLibraryStore } from '../../store/libraryStore';
import { ContextMenu } from '../UI/ContextMenu';
import { Modal, ModalInputForm } from '../UI/Modal';

interface BookItemProps {
  book: Book;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

export function BookItem({ book, index, isActive, onClick }: BookItemProps) {
  const { deleteBook, renameBook } = useLibraryStore();
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(book.title);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ x: e.clientX, y: e.clientY });
  };

  const handleMenuButton = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenu({ x: rect.left, y: rect.bottom + 4 });
  };

  const startRename = () => {
    setNewTitle(book.title);
    setRenaming(true);
  };

  const submitRename = () => {
    if (newTitle.trim()) renameBook(book.id, newTitle.trim());
    setRenaming(false);
  };

  const progress = book.lastReadPosition > 0 ? 'reading' : 'unread';

  return (
    <>
      <Draggable draggableId={book.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={onClick}
            onContextMenu={handleContextMenu}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
              select-none transition-colors text-sm
              ${snapshot.isDragging
                ? 'bg-indigo-100 dark:bg-indigo-900/40 shadow-lg opacity-90'
                : isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60'
              }`}
          >
            <BookOpen
              size={14}
              className={`flex-shrink-0 ${
                progress === 'reading'
                  ? 'text-indigo-500 dark:text-indigo-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            />
            <span className="flex-1 truncate">{book.title}</span>

            <button
              onClick={handleMenuButton}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded
                text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-opacity"
            >
              <MoreHorizontal size={14} />
            </button>
          </div>
        )}
      </Draggable>

      {menu && (
        <ContextMenu
          position={menu}
          onClose={() => setMenu(null)}
          items={[
            {
              label: 'Переименовать',
              icon: <Pencil size={14} />,
              onClick: startRename,
            },
            {
              label: 'Удалить',
              icon: <Trash2 size={14} />,
              danger: true,
              onClick: () => deleteBook(book.id),
            },
          ]}
        />
      )}

      <Modal isOpen={renaming} onClose={() => setRenaming(false)} title="Переименовать книгу">
        <ModalInputForm
          label="Название"
          value={newTitle}
          onChange={setNewTitle}
          onSubmit={submitRename}
          onCancel={() => setRenaming(false)}
          submitLabel="Переименовать"
        />
      </Modal>
    </>
  );
}
