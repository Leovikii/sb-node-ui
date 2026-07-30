import {
  ActionIcon,
  Button,
  Center,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  Title,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Languages, Moon, Sun } from 'lucide-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { ApiClientError } from '../../../src/api/client';
import { bootstrapApplication } from '../../app/session';
import { useSessionStore } from '../../stores/session';

export function ConnectPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const settings = useSessionStore((state) => state.settings);
  const setupRequired = useSessionStore((state) => state.setupRequired);
  const loading = useSessionStore((state) => state.loading);
  const login = useSessionStore((state) => state.login);
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { adminPassword: '' },
    validate: zod4Resolver(z.object({
      adminPassword: z.string().min(1, t('auth.passwordRequired')),
    })),
  });

  if (settings) return <Navigate replace to="/profiles" />;

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      const result = await login(values);
      await bootstrapApplication(true);
      form.reset();
      if (result.warning) {
        notifications.show({ color: 'yellow', message: t('workspace.loginWarning', { message: result.warning }) });
      }
      navigate('/profiles', { replace: true });
    } catch (error) {
      const message = error instanceof ApiClientError && error.status === 401
        ? t('errors.unauthorized')
        : t('errors.generic');
      notifications.show({ color: 'red', title: t('workspace.loginFailed', { message }), message });
    }
  });

  const dark = computedColorScheme === 'dark';
  const toggleLanguage = () => void i18n.changeLanguage(i18n.language === 'zh-CN' ? 'en-US' : 'zh-CN');

  return (
    <>
      <Group justify="flex-end" p="md">
        <Tooltip label={t('migration.switchLanguage')}>
          <ActionIcon variant="subtle" size="lg" aria-label={t('migration.switchLanguage')} onClick={toggleLanguage}>
            <Languages size={19} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={t('migration.switchTheme')}>
          <ActionIcon
            variant="subtle"
            size="lg"
            aria-label={t('migration.switchTheme')}
            onClick={() => setColorScheme(dark ? 'light' : 'dark')}
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </ActionIcon>
        </Tooltip>
      </Group>
      <Center mih="calc(100dvh - 68px)" p="md">
        <Paper withBorder shadow="sm" radius="lg" p={{ base: 'lg', sm: 'xl' }} w="100%" maw={440}>
          <form onSubmit={handleSubmit}>
            <Stack gap="lg">
              <div>
                <Text c="pink" fw={700} size="sm">{t('common.appName')}</Text>
                <Title order={1} mt={4}>{t(setupRequired ? 'auth.setupTitle' : 'auth.loginTitle')}</Title>
              </div>
              <PasswordInput
                label={t('auth.password')}
                autoComplete="current-password"
                withAsterisk
                key={form.key('adminPassword')}
                {...form.getInputProps('adminPassword')}
              />
              <Button type="submit" fullWidth loading={loading}>
                {t(setupRequired ? 'auth.setupAction' : 'auth.loginAction')}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Center>
    </>
  );
}
