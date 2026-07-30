import { Alert, Button, Center, Loader, Stack, Text } from '@mantine/core';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { useSessionStore } from '../stores/session';
import { bootstrapApplication } from './session';

export function BootstrapBoundary() {
  const { t } = useTranslation();
  const status = useSessionStore((state) => state.initializationStatus);

  useEffect(() => {
    if (status === 'idle') void bootstrapApplication();
  }, [status]);

  if (status === 'idle' || status === 'loading') {
    return (
      <Center mih="100dvh">
        <Stack align="center" gap="sm">
          <Loader />
          <Text c="dimmed">{t('auth.initializing')}</Text>
        </Stack>
      </Center>
    );
  }

  if (status === 'failed') {
    return (
      <Center mih="100dvh" p="md">
        <Alert color="red" title={t('auth.initializeFailed')} maw={440}>
          <Button mt="md" variant="light" onClick={() => void bootstrapApplication(true)}>
            {t('auth.retryInitialize')}
          </Button>
        </Alert>
      </Center>
    );
  }

  return <Outlet />;
}
