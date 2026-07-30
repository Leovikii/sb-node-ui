import { Container, Stack, Tabs, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const sections = ['general', 'subscription', 'repository', 'about'] as const;

export function SettingsLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const section = sections.find((item) => location.pathname.endsWith(`/${item}`)) ?? 'general';

  return (
    <Container size="md">
      <Stack gap="lg">
        <Title order={1}>{t('nav.settings')}</Title>
        <Tabs
          value={section}
          onChange={(value) => value && navigate(`/settings/${value}`)}
          keepMounted={false}
        >
          <Tabs.List aria-label={t('nav.settings')}>
            {sections.map((item) => (
              <Tabs.Tab key={item} value={item}>{t(`nav.${item}`)}</Tabs.Tab>
            ))}
          </Tabs.List>
          {sections.map((item) => (
            <Tabs.Panel key={item} value={item} pt="lg">
              {item === section ? <Outlet /> : null}
            </Tabs.Panel>
          ))}
        </Tabs>
      </Stack>
    </Container>
  );
}
