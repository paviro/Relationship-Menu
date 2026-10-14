'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import type { Node as PMNode } from '@tiptap/pm/model';
import { RichTextJSONPart } from '../../types';
import InlineColorPicker from './RichTextEditor/InlineColorPicker';

interface RichTextEditorProps {
  value: RichTextJSONPart[] | null;
  onChange: (richText: RichTextJSONPart[] | null) => void;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  className = "",
  autoFocus = false,
  disabled = false
}: RichTextEditorProps) {
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable heading, lists, etc. - we just want basic formatting
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
    ],
    content: richTextToPMDoc(value),
    editable: !disabled,
    immediatelyRender: false, // Fix SSR hydration issues
    onUpdate: ({ editor }) => {
      const richText = pmDocToRichText(editor.getJSON());
      onChange(richText);
    },
  });

  // Selection-aware toolbar state
  const [allBold, setAllBold] = useState(false);
  const [allItalic, setAllItalic] = useState(false);
  const [allUnderline, setAllUnderline] = useState(false);
  const [allStrike, setAllStrike] = useState(false);

  // Update computed toolbar state on selection/content changes
  useEffect(() => {
    if (!editor) return;
    const update = () => {
      setAllBold(isMarkActiveEverywhere(editor, 'bold'));
      setAllItalic(isMarkActiveEverywhere(editor, 'italic'));
      setAllUnderline(isMarkActiveEverywhere(editor, 'underline'));
      setAllStrike(isMarkActiveEverywhere(editor, 'strike'));
    };
    update();
    editor.on('selectionUpdate', update);
    editor.on('transaction', update);
    return () => {
      editor.off('selectionUpdate', update);
      editor.off('transaction', update);
    };
  }, [editor]);

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && !editor.isFocused) {
      const newDoc = richTextToPMDoc(value);
      editor.commands.setContent(newDoc);
    }
  }, [value, editor]);

  // Handle auto focus
  useEffect(() => {
    if (autoFocus && editor) {
      editor.commands.focus();
    }
  }, [autoFocus, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Toolbar */}
      <div className="toolbar flex flex-wrap gap-1 p-2 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={allBold}
          title="Bold"
        >
          <strong>B</strong>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={allItalic}
          title="Italic"
        >
          <em>I</em>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={allUnderline}
          title="Underline"
        >
          <u>U</u>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={allStrike}
          title="Strikethrough"
        >
          <s>S</s>
        </ToolbarButton>

        <div className="border-l border-gray-300 dark:border-gray-600 mx-1" />

        <InlineColorPicker editor={editor} />
        
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetColor().run()}
          title="Remove Color"
        >
          <span className="text-gray-600 dark:text-gray-400">A</span>
        </ToolbarButton>
      </div>
      
      {/* Editor Content */}
      <div className="editor-content bg-white dark:bg-gray-800">
        <EditorContent 
          editor={editor} 
          className="prose max-w-none p-3 min-h-[120px] focus-within:outline-none"
          style={{ 
            fontSize: '14px',
            lineHeight: '1.4'
          }}
        />
      </div>
    </div>
  );
}

function ToolbarButton({ 
  onClick, 
  isActive = false, 
  children, 
  title 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  children: React.ReactNode; 
  title?: string;
}) {
  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`
        min-w-10 px-3 py-1 rounded text-sm font-medium transition-colors
        ${isActive 
          ? 'bg-blue-500 text-white' 
          : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-500'
        }
        border border-gray-300 dark:border-gray-500
      `}
    >
      {children}
    </button>
  );
}
// Helper: check whether entire selection has mark (or caret inherits it)
function isMarkActiveEverywhere(editor: Editor, markName: string, attrs?: Record<string, unknown>): boolean {
  const { state } = editor;
  const { from, to, empty } = state.selection;
  if (empty) {
    return editor.isActive(markName, attrs);
  }
  let all = true;
  let sawText = false;
  state.doc.nodesBetween(from, to, (node: PMNode) => {
    if ((node as PMNode).isText && node.text && node.text.length > 0) {
      sawText = true;
      const has = (node.marks || []).some((m: { type: { name: string }; attrs?: Record<string, unknown> }) => {
        if (m.type.name !== markName) return false;
        if (!attrs) return true;
        return Object.entries(attrs).every(([k, v]) => (m.attrs as Record<string, unknown> | undefined)?.[k] === v);
      });
      if (!has) {
        all = false;
        return false; // stop
      }
    }
    return undefined;
  });
  return sawText ? all : false;
}

// JSON node types used for TipTap doc JSON
type PMJSONMark = { type: string; attrs?: Record<string, unknown> };
type PMJSONNode = { type: string; text?: string; marks?: PMJSONMark[]; content?: PMJSONNode[] };

// Convert runs -> ProseMirror doc JSON
function richTextToPMDoc(richText: RichTextJSONPart[] | null): JSONContent {
  if (!richText || richText.length === 0) {
    return { type: 'doc', content: [{ type: 'paragraph' }] };
  }

  const paragraph: PMJSONNode = { type: 'paragraph', content: [] };

  for (const part of richText) {
    const segments = String(part.text ?? '').split('\n');
    segments.forEach((seg, idx) => {
      if (seg.length > 0) {
        paragraph.content!.push({
          type: 'text',
          text: seg,
          marks: buildMarks(part)
        });
      }
      if (idx < segments.length - 1) {
        paragraph.content!.push({ type: 'hardBreak' });
      }
    });
  }

  return { type: 'doc', content: [paragraph] } as JSONContent;
}

function buildMarks(part: RichTextJSONPart): PMJSONMark[] | undefined {
  const marks: PMJSONMark[] = [];
  if (part.bold) marks.push({ type: 'bold' });
  if (part.italic) marks.push({ type: 'italic' });
  if (part.underline) marks.push({ type: 'underline' });
  if (part.strikethrough) marks.push({ type: 'strike' });
  if (part.color) marks.push({ type: 'textStyle', attrs: { color: part.color } });
  return marks.length ? marks : undefined;
}

// Convert ProseMirror doc JSON -> runs
function pmDocToRichText(doc: JSONContent | null): RichTextJSONPart[] | null {
  if (!doc || !('content' in doc) || !doc.content) return null;
  const parts: RichTextJSONPart[] = [];

  const append = (text: string, fmt: Partial<RichTextJSONPart>) => {
    if (!text) return;
    const last = parts[parts.length - 1];
    const next: RichTextJSONPart = {
      text,
      bold: fmt.bold ?? null,
      italic: fmt.italic ?? null,
      underline: fmt.underline ?? null,
      strikethrough: fmt.strikethrough ?? null,
      color: fmt.color ?? null,
    };
    if (
      last &&
      last.bold === next.bold &&
      last.italic === next.italic &&
      last.underline === next.underline &&
      last.strikethrough === next.strikethrough &&
      last.color === next.color
    ) {
      last.text += next.text;
    } else {
      parts.push(next);
    }
  };

  const walk = (node: PMJSONNode | undefined, fmt: Partial<RichTextJSONPart>) => {
    if (!node) return;
    switch (node.type) {
      case 'doc': {
        const content = node.content || [];
        content.forEach((n, idx: number) => {
          walk(n, fmt);
          if (idx < content.length - 1) {
            // Single newline between block nodes (paragraphs)
            append('\n', {});
          }
        });
        break;
      }
      case 'paragraph':
        (node.content || []).forEach((n) => walk(n, fmt));
        break;
      case 'text': {
        const nextFmt: Partial<RichTextJSONPart> = { ...fmt };
        if (Array.isArray(node.marks)) {
          for (const m of node.marks) {
            switch (m.type) {
              case 'bold': nextFmt.bold = true; break;
              case 'italic': nextFmt.italic = true; break;
              case 'underline': nextFmt.underline = true; break;
              case 'strike': nextFmt.strikethrough = true; break;
              case 'textStyle': if (m.attrs && 'color' in m.attrs && typeof m.attrs.color === 'string') nextFmt.color = m.attrs.color; break;
            }
          }
        }
        append(String(node.text || ''), nextFmt);
        break;
      }
      case 'hardBreak':
        append('\n', fmt);
        break;
      default:
        break;
    }
  };

  // doc from TipTap may be partial; cast to PMJSONNode for traversal root with default type
  walk(doc as PMJSONNode, {});

  if (parts.length > 0) {
    parts[parts.length - 1].text = parts[parts.length - 1].text.replace(/\n+$/, '');
  }

  return parts.length ? parts : null;
}

