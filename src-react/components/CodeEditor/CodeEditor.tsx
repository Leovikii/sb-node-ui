import { ActionIcon, Group, Paper, Tooltip, useComputedColorScheme } from '@mantine/core';
import { defaultKeymap, history, historyKeymap, redo, redoDepth, undo, undoDepth } from '@codemirror/commands';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { bracketMatching } from '@codemirror/language';
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
  ariaLabel: string;
}

function editorPhrases(language: string): Record<string, string> {
  return language === 'zh-CN' ? {
    Find: '查找',
    Replace: '替换为',
    next: '下一个匹配项',
    previous: '上一个匹配项',
    all: '选择全部匹配项',
    'match case': '区分大小写',
    regexp: '正则表达式',
    'by word': '全词匹配',
    replace: '替换当前项',
    'replace all': '全部替换',
    close: '关闭',
    Diagnostics: '诊断',
    'No diagnostics': '没有诊断信息',
  } : {};
}

function formatDocument(view: EditorView) {
  try {
    const source = view.state.doc.toString();
    const formatted = JSON.stringify(JSON.parse(source), null, 2);
    if (formatted !== source) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: formatted } });
    }
  } catch {
    // The JSON linter and save validation report invalid input.
  }
}

export default function CodeEditor({ value, onChange, ariaLabel }: CodeEditorProps) {
  const { t, i18n } = useTranslation();
  const colorScheme = useComputedColorScheme('light');
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const phrasesCompartment = useRef(new Compartment());
  const themeCompartment = useRef(new Compartment());
  const attributesCompartment = useRef(new Compartment());
  const initialValue = useRef(value);
  const initialLanguage = useRef(i18n.language);
  const initialColorScheme = useRef(colorScheme);
  const initialAriaLabel = useRef(ariaLabel);
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
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightActiveLine(),
          history(),
          json(),
          bracketMatching(),
          linter(jsonParseLinter()),
          search({ top: true }),
          keymap.of([
            { key: 'Mod-h', run: openSearchPanel, preventDefault: true },
            ...defaultKeymap,
            ...historyKeymap,
            ...searchKeymap,
            ...lintKeymap,
          ]),
          EditorView.domEventHandlers({
            blur: (_event, currentView) => {
              formatDocument(currentView);
              return false;
            },
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString());
            const nextHistoryState = {
              undo: undoDepth(update.state) > 0,
              redo: redoDepth(update.state) > 0,
            };
            setHistoryState((current) => (
              current.undo === nextHistoryState.undo && current.redo === nextHistoryState.redo
                ? current
                : nextHistoryState
            ));
          }),
          EditorState.tabSize.of(2),
          phrasesCompartment.current.of(EditorState.phrases.of(editorPhrases(initialLanguage.current))),
          themeCompartment.current.of(initialColorScheme.current === 'dark' ? oneDark : []),
          attributesCompartment.current.of(EditorView.contentAttributes.of({
            'aria-label': initialAriaLabel.current,
            'data-testid': 'code-editor-input',
          })),
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
    if (view) {
      view.dispatch({ effects: phrasesCompartment.current.reconfigure(EditorState.phrases.of(editorPhrases(i18n.language))) });
    }
  }, [i18n.language]);

  useEffect(() => {
    const view = viewRef.current;
    if (view) {
      view.dispatch({ effects: themeCompartment.current.reconfigure(colorScheme === 'dark' ? oneDark : []) });
    }
  }, [colorScheme]);

  useEffect(() => {
    const view = viewRef.current;
    if (view) {
      view.dispatch({ effects: attributesCompartment.current.reconfigure(EditorView.contentAttributes.of({
        'aria-label': ariaLabel,
        'data-testid': 'code-editor-input',
      })) });
    }
  }, [ariaLabel]);

  return (
    <div className={classes.root} data-testid="code-editor-shell">
      <Paper radius={0} px="xs" py={4} className={classes.toolbar} data-testid="code-editor-toolbar">
        <Group gap={4} wrap="wrap">
          <Tooltip label={t('common.undo')}>
            <ActionIcon
              size={44} variant="subtle" aria-label={t('common.undo')} disabled={!historyState.undo}
              onClick={() => viewRef.current && undo(viewRef.current)}
            >
              <Undo2 size={17} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t('common.redo')}>
            <ActionIcon
              size={44} variant="subtle" aria-label={t('common.redo')} disabled={!historyState.redo}
              onClick={() => viewRef.current && redo(viewRef.current)}
            >
              <Redo2 size={17} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t('common.formatJson')}>
            <ActionIcon
              size={44} variant="subtle" aria-label={t('common.formatJson')}
              onClick={() => viewRef.current && formatDocument(viewRef.current)}
            >
              <WandSparkles size={17} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t('common.searchReplace')}>
            <ActionIcon
              size={44} variant="subtle" aria-label={t('common.searchReplace')} ms="auto"
              onClick={() => viewRef.current && openSearchPanel(viewRef.current)}
            >
              <Search size={17} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Paper>
      <div ref={containerRef} className={classes.editor} data-testid="code-editor-mount" />
    </div>
  );
}
