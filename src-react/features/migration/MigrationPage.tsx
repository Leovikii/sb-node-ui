import { Alert, Badge, Card, Container, Group, Stack, Text, Title } from '@mantine/core';
import { CircleCheck, Construction } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MigrationPageProps {
  titleKey: string;
}

export function MigrationPage({ titleKey }: MigrationPageProps) {
  const { t } = useTranslation();

  return (
    <Container size="md" py={{ base: 'md', sm: 'xl' }}>
      <Stack gap="lg">
        <Badge variant="light" size="lg" w="fit-content">
          {t('migration.badge')}
        </Badge>
        <div>
          <Text c="dimmed" fw={600} mb={4}>
            {t(titleKey)}
          </Text>
          <Title order={1}>{t('migration.title')}</Title>
          <Text c="dimmed" mt="sm" maw={680}>
            {t('migration.description')}
          </Text>
        </div>
        <Alert icon={<Construction size={18} />} title={t('migration.pagePending')}>
          {t('migration.productionSafe')}
        </Alert>
        <Card withBorder padding="lg" radius="lg">
          <Stack gap="xs">
            <Group gap="xs">
              <CircleCheck size={18} aria-hidden />
              <Text fw={700}>{t('migration.stackTitle')}</Text>
            </Group>
            <Text c="dimmed">{t('migration.stack')}</Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
