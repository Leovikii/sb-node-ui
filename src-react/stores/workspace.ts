import { create } from 'zustand';
import type { StateData } from '../../shared';

interface WorkspaceStore {
  revision: string | null;
  state: StateData | null;
  dirty: boolean;
  replace: (state: StateData | null, revision?: string | null) => void;
  setDirty: (dirty: boolean) => void;
  clear: () => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  revision: null,
  state: null,
  dirty: false,
  replace: (state, revision) => set((current) => ({
    state,
    revision: revision === undefined ? current.revision : revision,
    dirty: false,
  })),
  setDirty: (dirty) => set({ dirty }),
  clear: () => set({ revision: null, state: null, dirty: false }),
}));
