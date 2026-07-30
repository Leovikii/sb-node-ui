import { ActionIcon, Button, CopyButton, Group, Paper, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { bootstrapApplication } from '../../app/session';
import { useSessionStore } from '../../stores/session';
import { useWorkspaceStore } from '../../stores/workspace';

export function SubscriptionSettings() {
  const { t } = useTranslation();
  const token = useSessionStore((state) => state.settings?.subToken ?? '');
  const loading = useSessionStore((state) => state.loading);
  const saveSettings = useSessionStore((state) => state.saveSettings);
  const revision = useWorkspaceStore((state) => state.revision);

  const rotate = async () => {
    if (!revision) {
      notifications.show({ color: 'red', message: t('workspace.revisionMissing') });
      return;
    }
    try {
      await saveSettings({ expectedRevision: revision, rotateSubscriptionToken: true });
      await bootstrapApplication(true);
      notifications.show({ color: 'green', message: t('workspace.settingsSaved') });
    } catch {
      notifications.show({ color: 'red', message: t('workspace.settingsFailed', { message: t('errors.generic') }) });
    }
  };

  const confirmRotate = () => modals.openConfirmModal({
    title: t('subscription.reset'),
    children: <Text size="sm">{t('subscription.rotateConfirm')}</Text>,
    labels: { confirm: t('common.confirm'), cancel: t('common.cancel') },
    confirmProps: { color: 'red' },
    centered: true,
    onConfirm: () => void rotate(),
  });

  return (
    <Paper withBorder radius="lg" p="lg">
      <Stack gap="xl">
        <Stack gap="xs">
          <Text fw={600}>{t('subscription.token')}</Text>
          <Group align="flex-end" wrap="nowrap">
            <TextInput value={token} readOnly aria-label={t('subscription.token')} ff="monospace" flex={1} />
            <CopyButton value={token} timeout={2000}>
              {({ copied, copy }) => (
                <Tooltip label={t(copied ? 'common.copied' : 'common.copy')}>
                  <ActionIcon
                    size={36}
                    color={copied ? 'teal' : 'gray'}
                    variant="light"
                    aria-label={t(copied ? 'common.copied' : 'common.copy')}
                    onClick={copy}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
        </Stack>
        <Group justify="space-between" align="center" wrap="wrap">
          <div>
            <Text fw={600}>{t('subscription.reset')}</Text>
            <Text c="dimmed" size="sm">{t('subscription.rotateHint')}</Text>
          </div>
          <Button color="red" variant="light" loading={loading} leftSection={<RefreshCw size={17} />} onClick={confirmRotate}>
            {t('subscription.rotate')}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
