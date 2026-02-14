'use client';

import { useWorkspaceStore } from '@/lib/store';
import { BlockEditor } from '@/components/editor/BlockEditor';
import { pageApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef } from 'react';

export default function WorkspacePage() {
  const { currentWorkspace, currentPage, updatePage } = useWorkspaceStore();
  const [title, setTitle] = useState('');
  const titleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTitle(currentPage?.title || '');
  }, [currentPage?.id, currentPage?.title]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current);
    }
    titleTimeoutRef.current = setTimeout(() => {
      if (currentPage) {
        updatePage(currentPage.id, { title: value });
      }
    }, 500);
  };

  if (!currentWorkspace) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Welcome to Votion</h2>
          <p className="text-muted-foreground">
            Select a workspace from the sidebar or create a new one to get started.
          </p>
        </div>
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            {currentWorkspace.name}
          </h2>
          <p className="text-muted-foreground">
            Select a page from the sidebar or create a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      {currentPage.coverUrl && (
        <div className="mb-6 h-48 w-full overflow-hidden rounded-lg">
          <img
            src={currentPage.coverUrl}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="mb-8">
        {currentPage.icon && (
          <span className="text-5xl mb-2 block">{currentPage.icon}</span>
        )}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled"
          className="w-full bg-transparent text-4xl font-bold outline-none placeholder:text-muted-foreground/50"
        />
      </div>

      <BlockEditor pageId={currentPage.id} />
    </div>
  );
}
