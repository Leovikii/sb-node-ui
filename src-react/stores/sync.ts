import { create } from 'zustand';
import type {
  GithubSyncConnectionRequest,
  SrsCompilerStatusResult,
  SyncOperationRequest,
  SyncOperationResult,
  SyncStatusResult,
} from '../../shared';
import { api } from '../../src/api/endpoints';

interface SyncStore {
  status: SyncStatusResult | null;
  compiler: SrsCompilerStatusResult | null;
  loading: boolean;
  operating: boolean;
  load: (force?: boolean) => Promise<SyncStatusResult>;
  loadCompiler: () => Promise<SrsCompilerStatusResult>;
  connect: (request: GithubSyncConnectionRequest) => Promise<SyncStatusResult>;
  disconnect: () => Promise<SyncStatusResult>;
  setCompiler: (enabled: boolean) => Promise<SrsCompilerStatusResult>;
  run: (direction: 'push' | 'pull', request: SyncOperationRequest) => Promise<SyncOperationResult>;
  reset: () => void;
}

let loadPromise: Promise<SyncStatusResult> | null = null;

export const useSyncStore = create<SyncStore>((set, get) => ({
  status: null,
  compiler: null,
  loading: false,
  operating: false,

  async load(force = false) {
    if (!force && loadPromise) return loadPromise;
    if (!force && get().status) return get().status as SyncStatusResult;
    set({ loading: true });
    loadPromise = api.getGithubSync()
      .then((status) => {
        set({ status });
        return status;
      })
      .finally(() => {
        set({ loading: false });
        loadPromise = null;
      });
    return loadPromise;
  },

  async loadCompiler() {
    const compiler = await api.getSrsCompiler();
    set({ compiler });
    return compiler;
  },

  async connect(request) {
    set({ operating: true });
    try {
      await api.connectGithubSync(request);
      return await get().load(true);
    } finally {
      set({ operating: false });
    }
  },

  async disconnect() {
    set({ operating: true });
    try {
      await api.disconnectGithubSync();
      return await get().load(true);
    } finally {
      set({ operating: false });
    }
  },

  async setCompiler(enabled) {
    set({ operating: true });
    try {
      const compiler = await api.setSrsCompiler(enabled);
      set({ compiler });
      return compiler;
    } finally {
      set({ operating: false });
    }
  },

  async run(direction, request) {
    set({ operating: true });
    try {
      const result = direction === 'push'
        ? await api.pushGithubSync(request)
        : await api.pullGithubSync(request);
      await get().load(true);
      return result;
    } finally {
      set({ operating: false });
    }
  },

  reset: () => set({ status: null, compiler: null, loading: false, operating: false }),
}));
