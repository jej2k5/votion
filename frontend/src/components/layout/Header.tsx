'use client';

import { useAuth } from '@/lib/auth';
import { useWorkspaceStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Dropdown, DropdownItem } from '@/components/ui/dropdown';
import { LogOut, User, ChevronRight } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const { currentWorkspace, currentPage } = useWorkspaceStore();

  return (
    <header className="flex h-12 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2 text-sm">
        {currentWorkspace && (
          <>
            <span className="font-medium">{currentWorkspace.name}</span>
            {currentPage && (
              <>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {currentPage.icon && <span className="mr-1">{currentPage.icon}</span>}
                  {currentPage.title || 'Untitled'}
                </span>
              </>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Dropdown
          align="right"
          trigger={
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm">{user?.name || user?.email}</span>
            </Button>
          }
        >
          <DropdownItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
