import { ActionIcon, Group, Paper, Tooltip } from '@mantine/core';
import { defaultKeymap, history, historyKeymap, redo, redoDepth, undo, undoDepth } from '@codemirror/commands';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { linter, lintKeymap } from '@codemirror/lint';
import { openSearchPanel, search, searchKeymap } from '@codemirror/search';
import { Compartment, EditorState, Transaction } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers } from '@codemirror/view';
import { Redo2, Search, Undo2, WandSparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './CodeEditor.module.css';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

function editorPhrases(language: string): Record<string, string> {
  return language === 'zh-CN' ? {
    Find: '查找', Replace: '替换', 'Replace all': '全部替换', Close: '关闭',
    next: '下一个', previous: '上一个', replace: '替换', 'replace all': '全部替换',
  } : {};
}

export default function CodeEditor({ value, onChange, readOnly = false }: CodeEditorProps) {
  const { t, i18n } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const readOnlyCompartment = useRef(new Compartment());
  const phrasesCompartment = useRef(new Compartment());
  const initialValue = useRef(value);
  const initialReadOnly = useRef(readOnly);
  const initialLanguage = useRef(i18n.language);
  const [historyState, setHistoryState] = useState({ undo: false, redo: false });

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current) return;
    const view = new EditorView({
      parent: containerRef.current,
      state: EditorState.create({
        doc: initialValue.current,
        extensions: [
          lineNumbers(), highlightActiveLineGutter(), highlightActiveLine(), history(), json(),
          linter(jsonParseLinter()), search({ top: true }), oneDark, EditorView.lineWrapping,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString());
            setHistoryState({ undo: undoDepth(update.state) > 0, redo: redoDepth(update.state) > 0 });
          }),
          keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap, ...lintKeymap]),
          phrasesCompartment.current.of(EditorState.phrases.of(editorPhrases(initialLanguage.current))),
          readOnlyCompartment.current.of(EditorState.readOnly.of(initialReadOnly.current)),
        ],
      }),
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (view && view.state.doc.toString() !== value) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
        annotations: Transaction.addToHistory.of(false),
      });
    }
  }, [value]);

  useEffect(() => {
    const view = viewRef.current;
    if (view) view.dispatch({ effects: readOnlyCompartment.current.reconfigure(EditorState.readOnly.of(readOnly)) });
  }, [readOnly]);

  useEffect(() => {
    const view = viewRef.current;
    if (view) view.dispatch({ effects: phrasesCompartment.current.reconfigure(EditorState.phrases.of(editorPhrases(i18n.language))) });
  }, [i18n.language]);

  const format = () => {
    const view = viewRef.current;
    if (!view) return;
    try {
      const formatted = JSON.stringify(JSON.parse(view.state.doc.toString()), null, 2);
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: formatted } });
    } catch {
      // The JSON linter reports invalid input inline.
    }
  };

  return (
    <div className={classes.root}>
      {!readOnly && (
        <Paper radius={0} p={6} bg="dark.7">
          <Group gap={4}>
            <Tooltip label={t('common.undo')}>
              <ActionIcon variant="subtle" color="gray" aria-label={t('common.undo')} disabled={!historyState.undo} onClick={() => viewRef.current && undo(viewRef.current)}>
                <Undo2 size={17} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t('common.redo')}>
              <ActionIcon variant="subtle" color="gray" aria-label={t('common.redo')} disabled={!historyState.redo} onClick={() => viewRef.current && redo(viewRef.current)}>
                <Redo2 size={17} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t('common.formatJson')}>
              <ActionIcon variant="subtle" color="gray" aria-label={t('common.formatJson')} onClick={format}>
                <WandSparkles size={17} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t('common.searchReplace')}>
              <ActionIcon variant="subtle" color="gray" aria-label={t('common.searchReplace')} ml="auto" onClick={() => viewRef.current && openSearchPanel(viewRef.current)}>
                <Search size={17} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Paper>
      )}
      <div ref={containerRef} className={classes.editor} />
    </div>
  );
}
