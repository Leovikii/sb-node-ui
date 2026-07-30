import { Anchor, Button, Code, DataList, Group, Paper } from '@mantine/core';
import { ExternalLink, GitFork } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AboutSettings() {
  const { t } = useTranslation();
  return (
    <Paper withBorder radius="lg" p="lg">
      <DataList withDivider>
        <DataList.Item>
          <DataList.ItemLabel>{t('about.version')}</DataList.ItemLabel>
          <DataList.ItemValue><Code>v3.1.0-beta.1</Code></DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>{t('about.runtime')}</DataList.ItemLabel>
          <DataList.ItemValue>{t('about.runtimeValue')}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>{t('about.license')}</DataList.ItemLabel>
          <DataList.ItemValue>
            <Anchor href="https://github.com/Leovikii/Sing-Sub/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
              <Group gap={4}>GPL-3.0 <ExternalLink size={13} /></Group>
            </Anchor>
          </DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>{t('about.source')}</DataList.ItemLabel>
          <DataList.ItemValue>
            <Button
              component="a"
              href="https://github.com/Leovikii/Sing-Sub"
              target="_blank"
              rel="noopener noreferrer"
              variant="light"
              leftSection={<GitFork size={17} />}
              rightSection={<ExternalLink size={14} />}
            >
              GitHub
            </Button>
          </DataList.ItemValue>
        </DataList.Item>
      </DataList>
    </Paper>
  );
}
