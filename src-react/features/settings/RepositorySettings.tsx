import {
  Alert,
  Badge,
  Button,
  Code,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { GitFork, Pencil, Unplug } from 'lucide-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useSyncStore } from '../../stores/sync';
import { useWorkspaceStore } from '../../stores/workspace';

export function RepositorySettings() {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const status = useSyncStore((state) => state.status);
  const compiler = useSyncStore((state) => state.compiler);
  const loading = useSyncStore((state) => state.loading);
  const operating = useSyncStore((state) => state.operating);
  const load = useSyncStore((state) => state.load);
  const loadCompiler = useSyncStore((state) => state.loadCompiler);
  const connect = useSyncStore((state) => state.connect);
  const disconnect = useSyncStore((state) => state.disconnect);
  const setCompiler = useSyncStore((state) => state.setCompiler);
  const replaceWorkspace = useWorkspaceStore((state) => state.replace);
  const workspaceState = useWorkspaceStore((state) => state.state);

  const form = useForm({
    mode: 'controlled',
    initialValues: { ownerRepo: '', pat: '' },
    validate: zod4Resolver(z.object({
      ownerRepo: z.string().regex(/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/, t('repository.invalidOwnerRepo')),
      pat: z.string().min(1, t('repository.patRequired')),
    })),
  });

  useEffect(() => {
    void Promise.all([load(), loadCompiler()]).catch(() => {
      notifications.show({ color: 'red', message: t('errors.generic') });
    });
  }, [load, loadCompiler, t]);

  const beginEdit = () => {
    form.setValues({ ownerRepo: status?.repository ?? '', pat: '' });
    setEditing(true);
  };

  const submit = form.onSubmit(async ({ ownerRepo, pat }) => {
    const [owner, repo] = ownerRepo.trim().split('/');
    try {
      await connect({ owner, repo, pat });
      await loadCompiler();
      form.reset();
      setEditing(false);
      notifications.show({ color: 'green', message: t('repository.connected') });
    } catch {
      notifications.show({ color: 'red', message: t('errors.generic') });
    }
  });

  const confirmDisconnect = () => modals.openConfirmModal({
    title: t('common.disconnect'),
    children: <Text size="sm">{t('repository.connectionHint')}</Text>,
    labels: { confirm: t('common.disconnect'), cancel: t('common.cancel') },
    confirmProps: { color: 'red' },
    centered: true,
    onConfirm: async () => {
      try {
        await disconnect();
        await loadCompiler();
      } catch {
        notifications.show({ color: 'red', message: t('errors.generic') });
      }
    },
  });

  const toggleCompiler = async (enabled: boolean) => {
    try {
      const result = await setCompiler(enabled);
      if (result.reconcile?.revision) replaceWorkspace(workspaceState, result.reconcile.revision);
      notifications.show({ color: 'green', message: t('repository.srsCompiler') });
    } catch {
      notifications.show({ color: 'red', message: t('repository.compilerError') });
    }
  };

  const changingRepository = Boolean(
    status?.repository && form.values.ownerRepo
    && status.repository.toLowerCase() !== form.values.ownerRepo.toLowerCase(),
  );

  return (
    <Stack gap="lg">
      <Paper withBorder radius="lg" p="lg" aria-busy={loading || operating}>
        <Stack gap="lg">
          <Group justify="space-between" align="flex-start" wrap="wrap">
            <div>
              <Text fw={600}>{t('repository.connection')}</Text>
              <Text c="dimmed" size="sm">{t('repository.connectionHint')}</Text>
            </div>
            <Badge color={status?.connected ? 'teal' : 'gray'} variant="light">
              {status?.connected ? status.repository : t('common.notConnected')}
            </Badge>
          </Group>

          {status?.connected && !editing ? (
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={600}>{t('repository.defaultBranch')}</Text>
                <Code>{status.defaultBranch}</Code>
              </Group>
              <Group justify="flex-end">
                <Button variant="light" leftSection={<Pencil size={17} />} onClick={beginEdit}>
                  {t('repository.replace')}
                </Button>
                <Button color="red" variant="subtle" leftSection={<Unplug size={17} />} loading={operating} onClick={confirmDisconnect}>
                  {t('common.disconnect')}
                </Button>
              </Group>
            </Stack>
          ) : (
            <form onSubmit={submit}>
              <Stack gap="md">
                <Group grow align="flex-start">
                  <TextInput
                    label={t('repository.ownerRepo')}
                    placeholder={t('repository.ownerRepoPlaceholder')}
                    autoComplete="off"
                    {...form.getInputProps('ownerRepo')}
                  />
                  <PasswordInput
                    label={t('repository.pat')}
                    autoComplete="new-password"
                    {...form.getInputProps('pat')}
                  />
                </Group>
                {changingRepository && <Alert color="yellow">{t('repository.differentRepositoryWarning')}</Alert>}
                <Group justify="flex-end">
                  {status?.connected && (
                    <Button type="button" variant="subtle" onClick={() => setEditing(false)}>{t('common.cancel')}</Button>
                  )}
                  <Button type="submit" loading={operating} leftSection={<GitFork size={17} />}>
                    {t('repository.connect')}
                  </Button>
                </Group>
              </Stack>
            </form>
          )}
        </Stack>
      </Paper>

      <Paper withBorder radius="lg" p="lg">
        <Group justify="space-between" align="center" wrap="wrap">
          <div>
            <Text fw={600}>{t('repository.srsCompiler')}</Text>
            <Text c="dimmed" size="sm">{t('repository.srsHint')}</Text>
          </div>
          <Group>
            <Badge color={compiler?.status === 'error' ? 'red' : compiler?.enabled ? 'teal' : 'gray'}>
              {operating ? t('common.loading') : t(compiler?.enabled ? 'common.enabled' : 'common.disabled')}
            </Badge>
            <Switch
              aria-label={t('repository.srsCompiler')}
              checked={compiler?.enabled ?? false}
              disabled={operating || !status?.connected}
              onChange={(event) => void toggleCompiler(event.currentTarget.checked)}
            />
          </Group>
        </Group>
        {compiler?.errorCode && <Alert color="red" mt="md">{t('repository.compilerError')}</Alert>}
      </Paper>
    </Stack>
  );
}
