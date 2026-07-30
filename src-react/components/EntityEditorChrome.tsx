import { Badge, Group, Modal, Text, TextInput, type TextInputProps } from '@mantine/core';

export function EntityEditorHeader({
  mode, kind, name, note, nameLabel, noteLabel, closeLabel, nameInputProps, noteInputProps,
}: {
  mode: 'edit' | 'preview';
  kind: string;
  name: string;
  note?: string;
  nameLabel: string;
  noteLabel: string;
  closeLabel: string;
  nameInputProps: TextInputProps;
  noteInputProps: TextInputProps;
}) {
  return (
    <Modal.Header data-testid="entity-editor-header">
      <Group gap="xs" wrap="nowrap" flex={1} miw={0} me="xs">
        <Badge size="sm" variant="light" flex="0 0 auto">{kind}</Badge>
        {mode === 'edit' ? (
          <>
            <TextInput
              size="sm" flex="1 1 10rem" miw={0}
              aria-label={nameLabel} placeholder={nameLabel}
              {...nameInputProps}
            />
            <TextInput
              size="sm" flex="1 1 10rem" miw={0}
              aria-label={noteLabel} placeholder={noteLabel}
              {...noteInputProps}
            />
          </>
        ) : (
          <>
            <Text
              component="h2" size="lg" fw={500} truncate flex="0 1 auto" miw={0} title={name}
              data-testid="entity-editor-name"
            >
              {name}
            </Text>
            {note?.trim() && (
              <Text
                size="sm" c="dimmed" truncate flex="1 1 auto" miw={0} ta="left" title={note}
                data-testid="entity-editor-note"
              >
                {note}
              </Text>
            )}
          </>
        )}
      </Group>
      <Modal.CloseButton aria-label={closeLabel} flex="0 0 auto" />
    </Modal.Header>
  );
}
