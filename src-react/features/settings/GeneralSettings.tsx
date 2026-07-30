import { Group, Paper, SegmentedControl, Select, Stack, Text, useMantineColorScheme } from '@mantine/core';
import type { MantineColorScheme } from '@mantine/core';
import { useTranslation } from 'react-i18next';

export function GeneralSettings() {
  const { t, i18n } = useTranslation();
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <Paper withBorder radius="lg" p="lg">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end" wrap="wrap">
          <Text fw={600}>{t('general.language')}</Text>
          <Select
            aria-label={t('general.language')}
            value={i18n.language}
            onChange={(value) => value && void i18n.changeLanguage(value)}
            allowDeselect={false}
            data={[
              { value: 'zh-CN', label: '简体中文' },
              { value: 'en-US', label: 'English' },
            ]}
            w={{ base: '100%', sm: 180 }}
          />
        </Group>
        <Group justify="space-between" align="flex-end" wrap="wrap">
          <Text fw={600}>{t('general.appearance')}</Text>
          <SegmentedControl<MantineColorScheme>
            aria-label={t('general.appearance')}
            value={colorScheme}
            onChange={setColorScheme}
            fullWidth
            data={[
              { value: 'auto', label: t('general.themeSystem') },
              { value: 'light', label: t('general.themeLight') },
              { value: 'dark', label: t('general.themeDark') },
            ]}
          />
        </Group>
      </Stack>
    </Paper>
  );
}
