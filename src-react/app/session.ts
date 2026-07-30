import type { BootstrapResult } from '../../shared';
import { onApiUnauthorized } from '../../src/api/client';
import { useAssetsStore } from '../stores/assets';
import { useSessionStore } from '../stores/session';
import { useSyncStore } from '../stores/sync';
import { useWorkspaceStore } from '../stores/workspace';

function applyBootstrap(result: BootstrapResult) {
  useWorkspaceStore.getState().replace(result.state ?? null, result.revision ?? null);
  if (!result.state) useAssetsStore.getState().reset();
}

export async function bootstrapApplication(force = false): Promise<BootstrapResult> {
  const result = await useSessionStore.getState().bootstrap(force);
  applyBootstrap(result);
  return result;
}

export function clearApplicationSession() {
  useSessionStore.getState().clear();
  useWorkspaceStore.getState().clear();
  useAssetsStore.getState().reset();
  useSyncStore.getState().reset();
}

onApiUnauthorized(clearApplicationSession);
