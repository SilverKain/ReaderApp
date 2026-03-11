import { useState } from 'react';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import { FolderItem } from './FolderItem';
import { BookItem } from './BookItem';
import { useLibraryStore } from '../../store/libraryStore';

interface FolderTreeProps {
  onBookSelect: (id: string) => void;
}

export function FolderTree({ onBookSelect }: FolderTreeProps) {
  const { folders, books, currentBookId, moveBook } = useLibraryStore();
  const [, forceUpdate] = useState(0);

  const rootFolders = folders.filter(f => f.parentId === null);
  const rootBooks = books.filter(b => b.folderId === null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newFolderId = destination.droppableId === '__root__' ? null : destination.droppableId;

    // Same location — no-op
    const book = books.find(b => b.id === draggableId);
    if (!book) return;
    if (book.folderId === newFolderId) return;

    moveBook(draggableId, newFolderId);
    forceUpdate(n => n + 1);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-0.5">
        {/* Root-level folders */}
        {rootFolders.map(folder => (
          <FolderItem
            key={folder.id}
            folder={folder}
            books={books}
            allFolders={folders}
            currentBookId={currentBookId}
            level={0}
            onBookSelect={onBookSelect}
          />
        ))}

        {/* Root-level books (no folder) */}
        {rootBooks.length > 0 && (
          <div>
            {rootFolders.length > 0 && (
              <div className="mx-3 my-1 border-t border-gray-200 dark:border-gray-700" />
            )}
            <Droppable droppableId="__root__" type="BOOK">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[4px] px-2 rounded-lg transition-colors
                    ${snapshot.isDraggingOver ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                >
                  {rootBooks.map((book, idx) => (
                    <BookItem
                      key={book.id}
                      book={book}
                      index={idx}
                      isActive={currentBookId === book.id}
                      onClick={() => onBookSelect(book.id)}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        )}

        {/* Empty root drop zone (when only folders exist) */}
        {rootBooks.length === 0 && (
          <Droppable droppableId="__root__" type="BOOK">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-[8px] mx-2 rounded-lg transition-colors
                  ${snapshot.isDraggingOver ? 'bg-indigo-50 dark:bg-indigo-900/20 min-h-[32px]' : ''}`}
              >
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}
      </div>
    </DragDropContext>
  );
}
