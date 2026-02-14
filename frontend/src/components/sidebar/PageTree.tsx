'use client';

import { useState, useMemo } from 'react';
import { useWorkspaceStore } from '@/lib/store';
import { Page } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronRight, FileText, Plus, Trash2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dropdown, DropdownItem } from '@/components/ui/dropdown';

interface PageTreeItemProps {
  page: Page;
  childrenMap: Map<string | null, Page[]>;
  depth: number;
  onSelect: (page: Page) => void;
  onCreateChild: (parentId: string) => void;
  onDelete: (id: string) => void;
  selectedId: string | null;
}

function PageTreeItem({
  page,
  childrenMap,
  depth,
  onSelect,
  onCreateChild,
  onDelete,
  selectedId,
}: PageTreeItemProps) {
  const [expanded, setExpanded] = useState(false);
  const children = childrenMap.get(page.id) || [];
  const hasChildren = children.length > 0;

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1 rounded-sm px-2 py-1 text-sm hover:bg-accent cursor-pointer',
          selectedId === page.id && 'bg-accent'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => onSelect(page)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className={cn(
            'shrink-0 rounded-sm p-0.5 hover:bg-accent-foreground/10',
            !hasChildren && 'invisible'
          )}
        >
          <ChevronRight
            className={cn(
              'h-3 w-3 transition-transform',
              expanded && 'rotate-90'
            )}
          />
        </button>

        <span className="shrink-0">
          {page.icon || <FileText className="h-4 w-4 text-muted-foreground" />}
        </span>

        <span className="truncate flex-1">{page.title || 'Untitled'}</span>

        <div className="hidden group-hover:flex items-center gap-0.5">
          <Dropdown
            trigger={
              <button className="rounded-sm p-0.5 hover:bg-accent-foreground/10" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            }
          >
            <DropdownItem onClick={() => onDelete(page.id)}>
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownItem>
          </Dropdown>
          <button
            className="rounded-sm p-0.5 hover:bg-accent-foreground/10"
            onClick={(e) => {
              e.stopPropagation();
              onCreateChild(page.id);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {expanded &&
        children.map((child) => (
          <PageTreeItem
            key={child.id}
            page={child}
            childrenMap={childrenMap}
            depth={depth + 1}
            onSelect={onSelect}
            onCreateChild={onCreateChild}
            onDelete={onDelete}
            selectedId={selectedId}
          />
        ))}
    </div>
  );
}

export function PageTree() {
  const {
    pages,
    currentWorkspace,
    currentPage,
    createPage,
    deletePage,
    setCurrentPage,
    loadPages,
  } = useWorkspaceStore();

  const childrenMap = useMemo(() => {
    const map = new Map<string | null, Page[]>();
    for (const page of pages) {
      const parentId = page.parentId;
      if (!map.has(parentId)) {
        map.set(parentId, []);
      }
      map.get(parentId)!.push(page);
    }
    return map;
  }, [pages]);

  const rootPages = childrenMap.get(null) || [];

  const handleSelect = async (page: Page) => {
    try {
      const { pageApi } = await import('@/lib/api');
      const { data } = await pageApi.getById(page.id);
      setCurrentPage(data);
    } catch {
      setCurrentPage(page);
    }
  };

  const handleCreatePage = async (parentId?: string) => {
    if (!currentWorkspace) return;
    const page = await createPage(currentWorkspace.id, { parentId });
    setCurrentPage(page);
  };

  const handleDelete = async (id: string) => {
    await deletePage(id);
    if (currentWorkspace) {
      await loadPages(currentWorkspace.id);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Pages
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={() => handleCreatePage()}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {rootPages.map((page) => (
        <PageTreeItem
          key={page.id}
          page={page}
          childrenMap={childrenMap}
          depth={0}
          onSelect={handleSelect}
          onCreateChild={(parentId) => handleCreatePage(parentId)}
          onDelete={handleDelete}
          selectedId={currentPage?.id || null}
        />
      ))}

      {rootPages.length === 0 && (
        <p className="px-2 py-4 text-center text-xs text-muted-foreground">
          No pages yet. Click + to create one.
        </p>
      )}
    </div>
  );
}
