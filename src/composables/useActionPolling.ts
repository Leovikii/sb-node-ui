import { ref, onBeforeUnmount } from 'vue';

export function useActionPolling(getRuns: (perPage?: number) => Promise<any>) {
  const actionState = ref<'idle' | 'queued' | 'in_progress' | 'success' | 'failure'>('idle');
  let pollTimer: ReturnType<typeof setTimeout> | null = null;
  let isPolling = false;

  function stopPolling() {
    isPolling = false;
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
  }

  async function getLatestRunId(): Promise<number> {
    try {
      const data = await getRuns(1);
      if (data?.workflow_runs?.length > 0) return data.workflow_runs[0].id;
    } catch { /* ignore */ }
    return 0;
  }

  function startPolling(previousRunId: number) {
    actionState.value = 'queued';
    stopPolling();
    isPolling = true;
    let attempts = 0;

    const poll = async () => {
      if (!isPolling) return;
      attempts++;
      if (attempts > 60) {
        actionState.value = 'idle';
        isPolling = false;
        return;
      }
      try {
        const data = await getRuns(5);
        const run = data.workflow_runs.find((r: any) => r.id > previousRunId);

        if (!run) {
          pollTimer = setTimeout(poll, 3000);
          return;
        }

        if (run.status === 'in_progress' || run.status === 'queued') {
          actionState.value = run.status;
          pollTimer = setTimeout(poll, 3000);
        } else if (run.status === 'completed') {
          actionState.value = run.conclusion === 'success' ? 'success' : 'failure';
          isPolling = false;
          if (actionState.value === 'success') {
            setTimeout(() => { actionState.value = 'idle'; }, 4000);
          }
        }
      } catch {
        pollTimer = setTimeout(poll, 3000);
      }
    };

    poll();
  }

  onBeforeUnmount(() => stopPolling());

  return { actionState, startPolling, stopPolling, getLatestRunId };
}
