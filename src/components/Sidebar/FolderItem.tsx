import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import {
  ChevronRight,
  ChevronDown,
  Folder as FolderIcon,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  FolderPlus,
  Upload,
} from 'lucide-react';
import type { Folder, Book } from '../../types';
import { useLibraryStore } from '../../store/libraryStore';
import { BookItem } from './BookItem';
import { ContextMenu } from '../UI/ContextMenu';
import { Modal, ModalInputForm } from '../UI/Modal';
import { UploadButton } from './UploadButton';

interface FolderItemProps {
  folder: Folder;
  books: Book[];
  allFolders: Folder[];
  currentBookId: string | null;
  level: number;
  onBookSelect: (id: string) => void;
}

export function FolderItem({
  folder,
  books,
  allFolders,
  currentBookId,
  level,
  onBookSelect,
}: FolderItemProps) {
  const { toggleFolderExpanded, addFolder, renameFolder, deleteFolder } =
    useLibraryStore();

  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [renamingValue, setRenamingValue] = useState(folder.name);
  const [addingSubfolder, setAddingSubfolder] = useState(false);
  const [newSubfolderName, setNewSubfolderName] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const folderBooks = books.filter(b => b.folderId === folder.id);
  const childFolders = allFolders.filter(f => f.parentId === folder.id);
  const isExpanded = folder.isExpanded;

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

  const submitRename = () => {
    if (renamingValue.trim()) renameFolder(folder.id, renamingValue.trim());
    setRenaming(false);
  };

  const submitAddSubfolder = async () => {
    if (newSubfolderName.trim()) {
      await addFolder(newSubfolderName.trim(), folder.id);
    }
    setNewSubfolderName('');
    setAddingSubfolder(false);
  };

  const indentPx = level * 12;

  return (
    <div>
      {/* Folder header row */}
      <div
        className="group flex items-center gap-1 py-1.5 rounded-lg cursor-pointer
          text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60
          transition-colors select-none pr-2"
        style={{ paddingLeft: `${8 + indentPx}px` }}
        onClick={() => toggleFolderExpanded(folder.id)}
        onContextMenu={handleContextMenu}
      >
        {/* Expand arrow */}
        <span className="flex-shrink-0 text-gray-400 dark:text-gray-500">
          {isExpanded
            ? <ChevronDown size={14} />
            : <ChevronRight size={14} />
          }
        </span>

        {/* Folder icon */}
        <span className="flex-shrink-0 text-yellow-500 dark:text-yellow-400">
          {isExpanded ? <FolderOpen size={15} /> : <FolderIcon size={15} />}
        </span>

        <span className="flex-1 truncate text-sm font-medium">{folder.name}</span>

        {/* Book count badge */}
        {folderBooks.length > 0 && (
          <span className="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500 mr-1">
            {folderBooks.length}
          </span>
        )}

        {/* Menu button */}
        <button
          onClick={handleMenuButton}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded
            text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-opacity"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div>
          {/* Droppable zone for books */}
          <Droppable droppableId={folder.id} type="BOOK">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{ paddingLeft: `${8 + indentPx + 20}px` }}
                className={`min-h-[4px] rounded-lg transition-colors
                  ${snapshot.isDraggingOver ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
              >
                {folderBooks.map((book, idx) => (
                  <BookItem
                    key={book.id}
                    book={book}
                    index={idx}
                    isActive={currentBookId === book.id}
                    onClick={() => onBookSelect(book.id)}
                  />
                ))}
                {provided.placeholder}
                {folderBooks.length === 0 && !snapshot.isDraggingOver && (
                  <div className="py-1 text-xs text-gray-400 dark:text-gray-600 italic">
                    Пусто
                  </div>
                )}
              </div>
            )}
          </Droppable>

          {/* Upload shortcut */}
          {showUpload && (
            <div style={{ paddingLeft: `${8 + indentPx + 20}px` }} className="pb-1">
              <UploadButton folderId={folder.id} compact />
            </div>
          )}

          {/* Child folders */}
          {childFolders.map(child => (
            <FolderItem
              key={child.id}
              folder={child}
              books={books}
              allFolders={allFolders}
              currentBookId={currentBookId}
              level={level + 1}
              onBookSelect={onBookSelect}
            />
          ))}
        </div>
      )}

      {/* Context menu */}
      {menu && (
        <ContextMenu
          position={menu}
          onClose={() => setMenu(null)}
          items={[
            {
              label: 'Загрузить книгу',
              icon: <Upload size={14} />,
              onClick: () => setShowUpload(v => !v),
            },
            {
              label: 'Новая подпапка',
              icon: <FolderPlus size={14} />,
              onClick: () => {
                setNewSubfolderName('');
                setAddingSubfolder(true);
              },
            },
            {
              label: 'Переименовать',
              icon: <Pencil size={14} />,
              onClick: () => {
                setRenamingValue(folder.name);
                setRenaming(true);
              },
              divider: true,
            },
            {
              label: 'Удалить папку',
              icon: <Trash2 size={14} />,
              danger: true,
              onClick: () => deleteFolder(folder.id),
            },
          ]}
        />
      )}

      {/* Rename modal */}
      <Modal isOpen={renaming} onClose={() => setRenaming(false)} title="Переименовать папку">
        <ModalInputForm
          label="Название папки"
          value={renamingValue}
          onChange={setRenamingValue}
          onSubmit={submitRename}
          onCancel={() => setRenaming(false)}
          submitLabel="Переименовать"
        />
      </Modal>

      {/* Add subfolder modal */}
      <Modal
        isOpen={addingSubfolder}
        onClose={() => setAddingSubfolder(false)}
        title="Новая подпапка"
      >
        <ModalInputForm
          label="Название подпапки"
          value={newSubfolderName}
          onChange={setNewSubfolderName}
          onSubmit={submitAddSubfolder}
          onCancel={() => setAddingSubfolder(false)}
          submitLabel="Создать"
          placeholder={`Внутри "${folder.name}"`}
        />
      </Modal>

      {/* Add folder button (quick action) */}
      {isExpanded && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setNewSubfolderName('');
            setAddingSubfolder(true);
          }}
          style={{ paddingLeft: `${8 + indentPx + 20}px` }}
          className="hidden group-hover:flex items-center gap-1 py-1 text-xs
            text-gray-400 dark:text-gray-600 hover:text-indigo-500 dark:hover:text-indigo-400
            transition-colors w-full"
        >
          <Plus size={11} /> Подпапка
        </button>
      )}
    </div>
  );
}
