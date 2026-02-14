import { create } from 'zustand';
import { Workspace, Page } from '@/types';
import { workspaceApi, pageApi } from './api';

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  pages: Page[];
  currentPage: Page | null;
  isLoadingWorkspaces: boolean;
  isLoadingPages: boolean;

  loadWorkspaces: () => Promise<void>;
  setCurrentWorkspace: (workspace: Workspace) => void;
  createWorkspace: (name: string) => Promise<Workspace>;
  deleteWorkspace: (id: string) => Promise<void>;

  loadPages: (workspaceId: string) => Promise<void>;
  setCurrentPage: (page: Page | null) => void;
  createPage: (workspaceId: string, data: { title?: string; parentId?: string }) => Promise<Page>;
  updatePage: (id: string, data: { title?: string; icon?: string; coverUrl?: string }) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  restorePage: (id: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  pages: [],
  currentPage: null,
  isLoadingWorkspaces: false,
  isLoadingPages: false,

  loadWorkspaces: async () => {
    set({ isLoadingWorkspaces: true });
    try {
      const { data } = await workspaceApi.list();
      set({ workspaces: data, isLoadingWorkspaces: false });
    } catch {
      set({ isLoadingWorkspaces: false });
    }
  },

  setCurrentWorkspace: (workspace) => {
    set({ currentWorkspace: workspace, currentPage: null, pages: [] });
  },

  createWorkspace: async (name) => {
    const { data } = await workspaceApi.create({ name });
    set((state) => ({ workspaces: [data, ...state.workspaces] }));
    return data;
  },

  deleteWorkspace: async (id) => {
    await workspaceApi.delete(id);
    set((state) => ({
      workspaces: state.workspaces.filter((w) => w.id !== id),
      currentWorkspace: state.currentWorkspace?.id === id ? null : state.currentWorkspace,
    }));
  },

  loadPages: async (workspaceId) => {
    set({ isLoadingPages: true });
    try {
      const { data } = await pageApi.list(workspaceId);
      set({ pages: data, isLoadingPages: false });
    } catch {
      set({ isLoadingPages: false });
    }
  },

  setCurrentPage: (page) => {
    set({ currentPage: page });
  },

  createPage: async (workspaceId, data) => {
    const { data: page } = await pageApi.create(workspaceId, data);
    set((state) => ({ pages: [...state.pages, page] }));
    return page;
  },

  updatePage: async (id, data) => {
    const { data: updated } = await pageApi.update(id, data);
    set((state) => ({
      pages: state.pages.map((p) => (p.id === id ? { ...p, ...updated } : p)),
      currentPage: state.currentPage?.id === id ? { ...state.currentPage, ...updated } : state.currentPage,
    }));
  },

  deletePage: async (id) => {
    await pageApi.delete(id);
    const state = get();
    set({
      pages: state.pages.filter((p) => p.id !== id),
      currentPage: state.currentPage?.id === id ? null : state.currentPage,
    });
  },

  restorePage: async (id) => {
    const { data: page } = await pageApi.restore(id);
    set((state) => ({ pages: [...state.pages, page] }));
  },
}));
