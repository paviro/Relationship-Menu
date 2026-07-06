"use client";

import React, { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { HexColorPicker } from 'react-colorful';
import type { Node as PMNode } from '@tiptap/pm/model';
import { useTheme } from '../../ThemeProvider';

export function InlineColorPicker({ editor }: { editor: Editor }) {
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedColorMode } = useTheme();
  const themeDefaultColor = resolvedColorMode === 'dark' ? '#ffffff' : '#000000';
  const [currentColor, setCurrentColor] = useState<string>(() => getCurrentColor(editor) ?? themeDefaultColor);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const selectionRef = useRef<{ from: number; to: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const isOpenRef = useRef<boolean>(false);
  const currentColorRef = useRef<string>(currentColor);
  const pointerFromPickerRef = useRef<boolean>(false);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    currentColorRef.current = currentColor;
  }, [currentColor]);

  useEffect(() => {
    const handleSelection = () => {
      if (isOpenRef.current) return;
      const color = getCurrentColor(editor);
      const next = color ?? themeDefaultColor;
      if (next !== currentColorRef.current) {
        setCurrentColor(next);
      }
    };
    editor.on('selectionUpdate', handleSelection);
    return () => {
      editor.off('selectionUpdate', handleSelection);
    };
  }, [editor, themeDefaultColor]);

  useEffect(() => {
    if (isOpenRef.current) return;
    const color = getCurrentColor(editor);
    if (!color) {
      setCurrentColor(themeDefaultColor);
    }
  }, [themeDefaultColor, editor]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!isOpen) return;
      const target = e.target as Node;
      const clickedInside = !!(containerRef.current && containerRef.current.contains(target)) || !!(buttonRef.current && buttonRef.current.contains(target));
      if (clickedInside) return;
      if (pointerFromPickerRef.current) {
        pointerFromPickerRef.current = false;
        return;
      }
      setIsOpen(false);
    }
    window.addEventListener('mousedown', onClickOutside);
    return () => window.removeEventListener('mousedown', onClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        ref={buttonRef}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          setIsOpen((v) => {
            const next = !v;
            if (next) {
              const { from, to } = editor.state.selection;
              selectionRef.current = { from, to };
            } else {
              selectionRef.current = null;
            }
            return next;
          });
        }}
        title="Text color"
        className="min-w-10 w-8 h-8 rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-600 flex items-center justify-center"
      >
        <span className="w-5 h-5 rounded" style={{ backgroundColor: currentColor }} />
      </button>
      {isOpen && (
        <div
          className="absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 p-2 bg-white dark:bg-gray-700 rounded shadow-lg border border-gray-200 dark:border-gray-600"
          style={{ width: 220 }}
          onMouseDown={(e) => { e.stopPropagation(); pointerFromPickerRef.current = true; }}
          onPointerDown={(e) => { e.stopPropagation(); pointerFromPickerRef.current = true; }}
          onTouchStart={(e) => { e.stopPropagation(); }}
          onClick={(e) => e.stopPropagation()}
        >
          <HexColorPicker
            color={currentColor}
            onChange={(hex) => {
              const treatAsUnset = isNearBlackOrWhite(hex);
              setCurrentColor(treatAsUnset ? themeDefaultColor : hex);
              const saved = selectionRef.current ?? { from: editor.state.selection.from, to: editor.state.selection.to };
              if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
              rafRef.current = requestAnimationFrame(() => {
                const { from, to } = editor.state.selection;
                const needsReselect = from !== saved.from || to !== saved.to;
                const chain = editor.chain().focus();
                if (needsReselect) chain.setTextSelection({ from: saved.from, to: saved.to });
                if (treatAsUnset) {
                  chain.unsetColor().run();
                } else {
                  chain.setColor(hex).run();
                }
              });
            }}
          />
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={currentColor}
              onChange={(e) => {
                const val = normalizeHex(e.target.value);
                const treatAsUnset = isNearBlackOrWhite(val);
                setCurrentColor(treatAsUnset ? themeDefaultColor : val);
                if (isValidHex(val)) {
                  const saved = selectionRef.current ?? { from: editor.state.selection.from, to: editor.state.selection.to };
                  const { from, to } = editor.state.selection;
                  const needsReselect = from !== saved.from || to !== saved.to;
                  const chain = editor.chain().focus();
                  if (needsReselect) chain.setTextSelection({ from: saved.from, to: saved.to });
                  if (treatAsUnset) {
                    chain.unsetColor().run();
                  } else {
                    chain.setColor(val).run();
                  }
                }
              }}
              className="w-28 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100"
            />
            <button
              onMouseDown={(e) => { e.stopPropagation(); }}
              onClick={(e) => {
                e.stopPropagation();
                const saved = selectionRef.current ?? { from: editor.state.selection.from, to: editor.state.selection.to };
                const { from, to } = editor.state.selection;
                const needsReselect = from !== saved.from || to !== saved.to;
                const chain = editor.chain().focus();
                if (needsReselect) chain.setTextSelection({ from: saved.from, to: saved.to });
                chain.unsetColor().run();
                setCurrentColor(themeDefaultColor);
              }}
              className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getCurrentColor(editor: Editor): string | null {
  const { state } = editor;
  const { from, to, empty } = state.selection;
  if (empty) {
    const active = editor.getAttributes('textStyle');
    const c = typeof active?.color === 'string' ? active.color : null;
    if (c && isNearBlackOrWhite(c)) return null;
    return c;
  }
  let color: string | null = null;
  let uniform = true;
  let sawText = false;
  state.doc.nodesBetween(from, to, (node: PMNode) => {
    if ((node as PMNode).isText && node.text && node.text.length > 0) {
      sawText = true;
      const mark = (node.marks || []).find((m: { type: { name: string }; attrs?: Record<string, unknown> }) => m.type.name === 'textStyle' && m.attrs?.color != null);
      const c = (mark?.attrs as Record<string, unknown> | undefined)?.color as string | undefined;
      if (color == null) {
        color = c ?? null;
      } else if (color !== (c ?? null)) {
        uniform = false;
        return false;
      }
    }
    return undefined;
  });
  if (!(sawText && uniform)) return null;
  if (color && isNearBlackOrWhite(color)) return null;
  return color;
}

function isValidHex(input: string): boolean {
  return /^#?[0-9a-fA-F]{6}$/.test(input);
}

function normalizeHex(input: string): string {
  const trimmed = input.trim();
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  return withHash.slice(0, 7);
}

function isNearBlackOrWhite(input: string, threshold: number = 16): boolean {
  const hex = normalizeHex(input);
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const { r, g, b } = rgb;
  const nearBlack = r <= threshold && g <= threshold && b <= threshold;
  const nearWhite = r >= 255 - threshold && g >= 255 - threshold && b >= 255 - threshold;
  return nearBlack || nearWhite;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHex(hex);
  if (!/^#[0-9a-fA-F]{6}$/.test(normalized)) return null;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return { r, g, b };
}

// Optional utility if needed elsewhere
export function isUniformColor(editor: Editor, color: string): boolean {
  const { state } = editor;
  const { from, to, empty } = state.selection;
  if (empty) {
    return editor.isActive('textStyle', { color });
  }
  let all = true;
  let sawText = false;
  state.doc.nodesBetween(from, to, (node: PMNode) => {
    if ((node as PMNode).isText && node.text && node.text.length > 0) {
      sawText = true;
      const colorMark = (node.marks || []).find(
        (m: { type: { name: string }; attrs?: Record<string, unknown> }) => m.type.name === 'textStyle' && m.attrs?.color != null
      );
      if (!colorMark || (colorMark.attrs as Record<string, unknown>).color !== color) {
        all = false;
        return false;
      }
    }
    return undefined;
  });
  return sawText ? all : false;
}

export default InlineColorPicker;
