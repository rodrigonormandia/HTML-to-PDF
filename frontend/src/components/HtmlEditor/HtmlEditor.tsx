import { useEffect, useRef } from 'react';
import { EditorView, keymap, placeholder, lineNumbers } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { html } from '@codemirror/lang-html';
import { autocompletion } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import {
  lightEditorTheme,
  darkEditorTheme,
  lightSyntaxHighlighting,
  darkSyntaxHighlighting,
} from './themes';
import { htmlCompletions } from './htmlCompletions';
import './HtmlEditor.css';

export interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onCtrlEnter?: () => void;
  maxLength?: number;
  placeholder?: string;
  theme?: 'light' | 'dark';
  minHeight?: string;
  className?: string;
}

// Compartment for dynamic theme switching
const themeCompartment = new Compartment();
const syntaxCompartment = new Compartment();

export function HtmlEditor({
  value,
  onChange,
  onCtrlEnter,
  maxLength,
  placeholder: placeholderText,
  theme = 'light',
  minHeight = '300px',
  className = '',
}: HtmlEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView | null>(null);
  const isExternalUpdate = useRef(false);

  // Create Ctrl+Enter keymap
  const ctrlEnterKeymap = keymap.of([
    {
      key: 'Mod-Enter',
      run: () => {
        if (onCtrlEnter) {
          onCtrlEnter();
          return true;
        }
        return false;
      },
    },
  ]);

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current) return;

    const isDark = theme === 'dark';

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && !isExternalUpdate.current) {
        let newValue = update.state.doc.toString();

        // Enforce maxLength
        if (maxLength && newValue.length > maxLength) {
          newValue = newValue.slice(0, maxLength);
        }

        onChange(newValue);
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        history(),
        html(),
        autocompletion({
          override: [htmlCompletions],
        }),
        themeCompartment.of(isDark ? darkEditorTheme : lightEditorTheme),
        syntaxCompartment.of(isDark ? darkSyntaxHighlighting : lightSyntaxHighlighting),
        placeholderText ? placeholder(placeholderText) : [],
        ctrlEnterKeymap,
        keymap.of([...defaultKeymap, ...historyKeymap]),
        updateListener,
        EditorView.lineWrapping,
      ],
    });

    editorRef.current = new EditorView({
      state,
      parent: containerRef.current,
    });

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, []); // Only run once on mount

  // Update theme when it changes
  useEffect(() => {
    if (!editorRef.current) return;

    const isDark = theme === 'dark';

    editorRef.current.dispatch({
      effects: [
        themeCompartment.reconfigure(isDark ? darkEditorTheme : lightEditorTheme),
        syntaxCompartment.reconfigure(isDark ? darkSyntaxHighlighting : lightSyntaxHighlighting),
      ],
    });
  }, [theme]);

  // Sync external value changes (e.g., template loading)
  useEffect(() => {
    if (!editorRef.current) return;

    const currentValue = editorRef.current.state.doc.toString();
    if (value !== currentValue) {
      isExternalUpdate.current = true;

      editorRef.current.dispatch({
        changes: {
          from: 0,
          to: currentValue.length,
          insert: value,
        },
      });

      isExternalUpdate.current = false;
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className={`html-editor-wrapper ${theme === 'dark' ? 'dark' : ''} ${className}`}
      style={{ minHeight }}
    />
  );
}
