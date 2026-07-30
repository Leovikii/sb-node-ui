import { Badge, Group, SimpleGrid, Stack, Text } from '@mantine/core';

export function EntityEditorTitle({ kind, title }: { kind: string; title: string }) {
  return (
    <Group component="span" gap="xs" wrap="nowrap" miw={0}>
      <Badge component="span" size="sm" variant="light" flex="0 0 auto">{kind}</Badge>
      <Text component="span" inherit truncate miw={0} title={title}>{title}</Text>
    </Group>
  );
}

export function ReadOnlyEntityMetadata({
  name, note, nameLabel, noteLabel, noNoteLabel,
}: {
  name: string;
  note: string;
  nameLabel: string;
  noteLabel: string;
  noNoteLabel: string;
}) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }}>
      <Stack gap={2} miw={0}>
        <Text size="xs" c="dimmed" fw={600}>{nameLabel}</Text>
        <Text fw={500} style={{ overflowWrap: 'anywhere' }}>{name}</Text>
      </Stack>
      <Stack gap={2} miw={0}>
        <Text size="xs" c="dimmed" fw={600}>{noteLabel}</Text>
        <Text c={note ? undefined : 'dimmed'} style={{ overflowWrap: 'anywhere' }}>
          {note || noNoteLabel}
        </Text>
      </Stack>
    </SimpleGrid>
  );
}
