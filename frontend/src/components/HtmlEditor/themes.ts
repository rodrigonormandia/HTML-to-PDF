import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

// Light theme editor styling
export const lightEditorTheme = EditorView.theme({
  '&': {
    backgroundColor: '#ffffff',
    color: '#111827',
  },
  '.cm-content': {
    caretColor: '#3b82f6',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    fontSize: '14px',
  },
  '.cm-cursor': {
    borderLeftColor: '#3b82f6',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: '#dbeafe',
  },
  '.cm-gutters': {
    backgroundColor: '#f9fafb',
    color: '#9ca3af',
    border: 'none',
    borderRight: '1px solid #e5e7eb',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#f3f4f6',
  },
  '.cm-activeLine': {
    backgroundColor: '#f9fafb',
  },
  '.cm-line': {
    padding: '0 4px',
  },
  '.cm-tooltip': {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
  '.cm-tooltip-autocomplete': {
    '& > ul > li[aria-selected]': {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
    },
  },
}, { dark: false });

// Dark theme editor styling
export const darkEditorTheme = EditorView.theme({
  '&': {
    backgroundColor: '#374151',
    color: '#f3f4f6',
  },
  '.cm-content': {
    caretColor: '#60a5fa',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    fontSize: '14px',
  },
  '.cm-cursor': {
    borderLeftColor: '#60a5fa',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: '#1e3a5f',
  },
  '.cm-gutters': {
    backgroundColor: '#1f2937',
    color: '#9ca3af',
    border: 'none',
    borderRight: '1px solid #4b5563',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#374151',
  },
  '.cm-activeLine': {
    backgroundColor: '#4b556330',
  },
  '.cm-line': {
    padding: '0 4px',
  },
  '.cm-tooltip': {
    backgroundColor: '#1f2937',
    border: '1px solid #4b5563',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
  },
  '.cm-tooltip-autocomplete': {
    '& > ul > li[aria-selected]': {
      backgroundColor: '#1e3a5f',
      color: '#93c5fd',
    },
  },
}, { dark: true });

// Light syntax highlighting
export const lightSyntaxHighlighting = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.tagName, color: '#dc2626' },          // red-600
  { tag: tags.attributeName, color: '#d97706' },    // amber-600
  { tag: tags.attributeValue, color: '#059669' },   // emerald-600
  { tag: tags.string, color: '#059669' },           // emerald-600
  { tag: tags.comment, color: '#6b7280' },          // gray-500
  { tag: tags.angleBracket, color: '#4b5563' },     // gray-600
  { tag: tags.keyword, color: '#7c3aed' },          // violet-600
  { tag: tags.operator, color: '#4b5563' },         // gray-600
  { tag: tags.number, color: '#2563eb' },           // blue-600
  { tag: tags.propertyName, color: '#0891b2' },     // cyan-600
]));

// Dark syntax highlighting
export const darkSyntaxHighlighting = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.tagName, color: '#f87171' },          // red-400
  { tag: tags.attributeName, color: '#fbbf24' },    // amber-400
  { tag: tags.attributeValue, color: '#34d399' },   // emerald-400
  { tag: tags.string, color: '#34d399' },           // emerald-400
  { tag: tags.comment, color: '#9ca3af' },          // gray-400
  { tag: tags.angleBracket, color: '#d1d5db' },     // gray-300
  { tag: tags.keyword, color: '#a78bfa' },          // violet-400
  { tag: tags.operator, color: '#d1d5db' },         // gray-300
  { tag: tags.number, color: '#60a5fa' },           // blue-400
  { tag: tags.propertyName, color: '#22d3ee' },     // cyan-400
]));
