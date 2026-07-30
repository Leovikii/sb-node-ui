import { create } from 'zustand';
import type { BootstrapResult, LoginResult, PublicUserSettings, SetupData, UpdateSettingsRequest } from '../../shared';
import { api } from '../../src/api/endpoints';

type InitializationStatus = 'idle' | 'loading' | 'ready' | 'failed';

interface SessionStore {
  settings: PublicUserSettings | null;
  setupRequired: boolean;
  initializationStatus: InitializationStatus;
  loading: boolean;
  bootstrap: (force?: boolean) => Promise<BootstrapResult>;
  login: (request: SetupData) => Promise<LoginResult>;
  saveSettings: (request: UpdateSettingsRequest) => Promise<LoginResult>;
  logout: () => Promise<void>;
  clear: () => void;
}

let bootstrapPromise: Promise<BootstrapResult> | null = null;

export const useSessionStore = create<SessionStore>((set, get) => ({
  settings: null,
  setupRequired: false,
  initializationStatus: 'idle',
  loading: false,

  async bootstrap(force = false) {
    if (!force && bootstrapPromise) return bootstrapPromise;
    if (!force && get().initializationStatus === 'ready') {
      return {
        settings: get().settings,
        setupRequired: get().setupRequired,
      };
    }

    set({ initializationStatus: 'loading' });
    bootstrapPromise = api.bootstrap()
      .then((result) => {
        set({
          settings: result.settings,
          setupRequired: result.setupRequired,
          initializationStatus: 'ready',
        });
        return result;
      })
      .catch((error: unknown) => {
        set({ settings: null, initializationStatus: 'failed' });
        throw error;
      })
      .finally(() => {
        bootstrapPromise = null;
      });

    return bootstrapPromise;
  },

  async login(request) {
    set({ loading: true });
    try {
      const result = await api.login(request);
      set({ settings: result });
      return result;
    } finally {
      set({ loading: false });
    }
  },

  async saveSettings(request) {
    set({ loading: true });
    try {
      const result = await api.saveSettings(request);
      set({ settings: result });
      return result;
    } finally {
      set({ loading: false });
    }
  },

  async logout() {
    try {
      await api.logout();
    } finally {
      get().clear();
    }
  },

  clear() {
    set({
      settings: null,
      setupRequired: false,
      initializationStatus: 'ready',
      loading: false,
    });
  },
}));
