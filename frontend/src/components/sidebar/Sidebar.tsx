'use client';

import { WorkspaceSwitcher } from '@/components/layout/WorkspaceSwitcher';
import { PageTree } from './PageTree';
import { useWorkspaceStore } from '@/lib/store';

export function Sidebar() {
  const { currentWorkspace } = useWorkspaceStore();

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-secondary/30">
      <div className="p-2">
        <WorkspaceSwitcher />
      </div>

      <div className="flex-1 overflow-y-auto px-1 py-2">
        {currentWorkspace ? (
          <PageTree />
        ) : (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">
            Select or create a workspace to get started.
          </p>
        )}
      </div>
    </aside>
  );
}
