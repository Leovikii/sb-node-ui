import {
  ActionIcon, Button, Group, JsonInput, Popover, Stack, Text, TextInput, Tooltip,
} from '@mantine/core';
import { ChevronDown, ChevronUp, Search, WandSparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  validationError: string;
}

interface Match {
  start: number;
  end: number;
}

function findMatches(value: string, query: string): Match[] {
  if (!query) return [];
  const matches: Match[] = [];
  let start = 0;
  while (start <= value.length - query.length) {
    const index = value.indexOf(query, start);
    if (index === -1) break;
    matches.push({ start: index, end: index + query.length });
    start = index + query.length;
  }
  return matches;
}

export function JsonEditor({ value, onChange, ariaLabel, validationError }: JsonEditorProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const findRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const [opened, setOpened] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [focusTarget, setFocusTarget] = useState<'find' | 'replace'>('find');
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const matches = useMemo(() => findMatches(value, query), [query, value]);

  useEffect(() => {
    if (!opened) return;
    const target = focusTarget === 'replace' ? replaceRef.current : findRef.current;
    target?.focus();
    target?.select();
  }, [focusTarget, opened, showReplace]);

  const openSearch = (replace: boolean) => {
    setShowReplace((current) => current || replace);
    setFocusTarget(replace && query ? 'replace' : 'find');
    setOpened(true);
  };

  const selectMatch = (index: number) => {
    const match = matches[index];
    const input = inputRef.current;
    if (!match || !input) return;
    setActiveIndex(index);
    input.focus();
    input.setSelectionRange(match.start, match.end);
  };

  const nextMatch = () => {
    if (!matches.length) return;
    if (activeIndex >= 0) return selectMatch((activeIndex + 1) % matches.length);
    const caret = inputRef.current?.selectionEnd ?? 0;
    const next = matches.findIndex((match) => match.start >= caret);
    selectMatch(next === -1 ? 0 : next);
  };

  const previousMatch = () => {
    if (!matches.length) return;
    if (activeIndex >= 0) return selectMatch((activeIndex - 1 + matches.length) % matches.length);
    const caret = inputRef.current?.selectionStart ?? value.length;
    let previous = matches.length - 1;
    for (let index = matches.length - 1; index >= 0; index -= 1) {
      if (matches[index].end <= caret) { previous = index; break; }
    }
    selectMatch(previous);
  };

  const replaceCurrent = () => {
    if (!matches.length) return;
    const index = activeIndex >= 0 ? activeIndex : 0;
    const match = matches[index];
    onChange(`${value.slice(0, match.start)}${replacement}${value.slice(match.end)}`);
    setActiveIndex(-1);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(match.start, match.start + replacement.length);
    });
  };

  const replaceAll = () => {
    if (!query || !matches.length) return;
    onChange(value.split(query).join(replacement));
    setActiveIndex(-1);
  };

  const format = () => {
    try {
      onChange(JSON.stringify(JSON.parse(value), null, 2));
    } catch {
      inputRef.current?.focus();
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key !== 'f' && key !== 'h') return;
    event.preventDefault();
    openSearch(key === 'h');
  };

  const searchControls = (
    <Group gap={2} wrap="nowrap">
      <Tooltip label={t('common.formatJson')}>
        <ActionIcon size={44} variant="subtle" aria-label={t('common.formatJson')} onClick={format}>
          <WandSparkles size={17} />
        </ActionIcon>
      </Tooltip>
      <Popover
        opened={opened} onChange={setOpened} position="bottom-end" width="min(22rem, calc(100vw - 2rem))"
        shadow="md" returnFocus={false} transitionProps={{ transition: 'pop', duration: 120 }}
      >
        <Popover.Target>
          <Tooltip label={t('common.searchReplace')}>
            <ActionIcon size={44} variant="subtle" aria-label={t('common.searchReplace')} onClick={() => openSearch(false)}>
              <Search size={17} />
            </ActionIcon>
          </Tooltip>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack gap="xs">
            <TextInput
              ref={findRef} label={t('assets.find')} value={query}
              onChange={(event) => { setQuery(event.currentTarget.value); setActiveIndex(-1); }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  if (event.shiftKey) previousMatch(); else nextMatch();
                }
              }}
            />
            {showReplace && (
              <TextInput ref={replaceRef} label={t('assets.replaceWith')} value={replacement} onChange={(event) => setReplacement(event.currentTarget.value)} />
            )}
            <Group gap="xs" wrap="wrap">
              <Tooltip label={t('assets.previousMatch')}>
                <ActionIcon size={44} variant="light" aria-label={t('assets.previousMatch')} disabled={!matches.length} onClick={previousMatch}>
                  <ChevronUp size={17} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={t('assets.nextMatch')}>
                <ActionIcon size={44} variant="light" aria-label={t('assets.nextMatch')} disabled={!matches.length} onClick={nextMatch}>
                  <ChevronDown size={17} />
                </ActionIcon>
              </Tooltip>
              {showReplace && (
                <>
                  <Button h={44} size="compact-sm" variant="light" disabled={!matches.length} onClick={replaceCurrent}>{t('assets.replaceCurrent')}</Button>
                  <Button h={44} size="compact-sm" variant="light" disabled={!matches.length} onClick={replaceAll}>{t('assets.replaceAll')}</Button>
                </>
              )}
              <Text size="xs" c="dimmed" ms="auto" aria-live="polite">
                {activeIndex >= 0 ? activeIndex + 1 : 0} / {matches.length}
              </Text>
            </Group>
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </Group>
  );

  return (
    <JsonInput
      ref={inputRef} aria-label={ariaLabel} value={value} onChange={onChange}
      validationError={validationError} formatOnBlur resize="none" spellCheck={false}
      rightSection={searchControls} rightSectionWidth={96} rightSectionPointerEvents="all"
      rightSectionProps={{ style: { alignItems: 'flex-start', paddingTop: 6 } }}
      styles={{ input: { height: '52dvh', overflow: 'auto', fontFamily: 'var(--mantine-font-family-monospace)' } }}
      onKeyDown={handleKeyDown}
    />
  );
}
