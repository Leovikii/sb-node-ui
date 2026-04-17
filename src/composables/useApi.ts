import { ref } from 'vue';
import type { GithubConfig, GithubUser, StateData } from '../types';

export function useApi() {
  const user = ref<GithubUser | null>(null);
  const isConnected = ref(false);

  async function apiCall(path: string, options: RequestInit = {}): Promise<any> {
    const res = await fetch(path, {
      ...options,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    if (res.status === 401) {
      isConnected.value = false;
      user.value = null;
      throw new Error('Session expired');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || res.statusText);
    }
    return res.json();
  }

  async function connect(config: GithubConfig): Promise<{ state: StateData; sha: string; gistId: string }> {
    const data = await apiCall('/api/connect', {
      method: 'POST',
      body: JSON.stringify(config),
    });
    user.value = data.user;
    isConnected.value = true;
    return { state: data.state, sha: data.sha, gistId: data.gistId || '' };
  }

  async function disconnect(): Promise<void> {
    try {
      await apiCall('/api/disconnect', { method: 'POST' });
    } finally {
      user.value = null;
      isConnected.value = false;
    }
  }

  async function restoreSession(): Promise<{ state: StateData; sha: string; user: GithubUser; owner: string; repo: string; gistId: string } | null> {
    try {
      const data = await apiCall('/api/state');
      user.value = data.user;
      isConnected.value = true;
      return { state: data.state, sha: data.sha, user: data.user, owner: data.owner, repo: data.repo, gistId: data.gistId };
    } catch {
      return null;
    }
  }

  async function saveState(state: StateData, sha: string): Promise<{ sha: string }> {
    return apiCall('/api/state', {
      method: 'PUT',
      body: JSON.stringify({ state, sha }),
    });
  }

  async function refresh(): Promise<void> {
    await apiCall('/api/refresh', { method: 'POST' });
  }

  async function getRuns(perPage = 5): Promise<any> {
    return apiCall(`/api/runs?per_page=${perPage}`);
  }

  async function getGistPreview(name: string): Promise<string> {
    const data = await apiCall(`/api/gist/${name}`);
    return data.content;
  }

  return {
    user, isConnected,
    connect, disconnect, restoreSession,
    saveState, refresh, getRuns, getGistPreview,
  };
}
