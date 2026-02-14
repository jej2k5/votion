'use client';

import { useState } from 'react';
import { useWorkspaceStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Dropdown, DropdownItem } from '@/components/ui/dropdown';
import { Plus, ChevronDown, Building2 } from 'lucide-react';
import { Workspace } from '@/types';

export function WorkspaceSwitcher() {
  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    createWorkspace,
    loadPages,
  } = useWorkspaceStore();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSelect = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    loadPages(workspace.id);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    try {
      const workspace = await createWorkspace(newName.trim());
      setCurrentWorkspace(workspace);
      loadPages(workspace.id);
      setNewName('');
      setShowCreate(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Dropdown
        trigger={
          <Button variant="ghost" className="w-full justify-between px-2">
            <div className="flex items-center gap-2 truncate">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="truncate text-sm font-medium">
                {currentWorkspace?.name || 'Select workspace'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        }
      >
        {workspaces.map((w) => (
          <DropdownItem
            key={w.id}
            onClick={() => handleSelect(w)}
            className={w.id === currentWorkspace?.id ? 'bg-accent' : ''}
          >
            <Building2 className="mr-2 h-4 w-4" />
            {w.name}
          </DropdownItem>
        ))}
        <hr className="my-1" />
        <DropdownItem onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New workspace
        </DropdownItem>
      </Dropdown>

      <Dialog open={showCreate} onClose={() => setShowCreate(false)}>
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            placeholder="Workspace name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating || !newName.trim()}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
