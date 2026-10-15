/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link2,
  Quote,
  Eraser,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

/**
 * A lightweight WYSIWYG editor for blog content. It edits HTML directly (the
 * website renders the stored HTML), so the admin can apply bold, underline,
 * headings, lists, quotes and links without writing any markup by hand.
 *
 * It is intentionally dependency-free: formatting runs through the browser's
 * built-in editing commands and the editor emits its innerHTML on every change.
 */
const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  // Which formats apply to the current cursor/selection, so the toolbar can
  // show which buttons are "on".
  const [active, setActive] = useState<Record<string, boolean>>({});

  // Read the formatting state at the caret and light up the matching buttons.
  const refreshActive = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const sel = window.getSelection();
    // Only reflect state while the caret is actually inside this editor.
    if (!sel || sel.rangeCount === 0 || !el.contains(sel.anchorNode)) {
      setActive({});
      return;
    }
    let block = '';
    try {
      block = (document.queryCommandValue('formatBlock') || '').toString().toLowerCase();
    } catch {
      /* ignore */
    }
    const state = (cmd: string) => {
      try {
        return document.queryCommandState(cmd);
      } catch {
        return false;
      }
    };
    setActive({
      bold: state('bold'),
      italic: state('italic'),
      underline: state('underline'),
      insertUnorderedList: state('insertUnorderedList'),
      insertOrderedList: state('insertOrderedList'),
      h2: block === 'h2',
      h3: block === 'h3',
      blockquote: block === 'blockquote',
    });
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', refreshActive);
    return () => document.removeEventListener('selectionchange', refreshActive);
  }, [refreshActive]);

  // Load the incoming value into the editor when it changes from the outside
  // (first mount, or switching to a different post). We skip this while the
  // user is actively typing in it, otherwise the caret would jump to the start.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.innerHTML !== (value || '')) {
      el.innerHTML = value || '';
    }
  }, [value]);

  const emitChange = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const exec = (command: string, arg?: string) => {
    editorRef.current?.focus();
    // eslint-disable-next-line deprecation/deprecation
    document.execCommand(command, false, arg);
    emitChange();
    refreshActive();
  };

  const addLink = () => {
    const url = window.prompt('Enter the link URL (include https://):', 'https://');
    if (!url) return;
    exec('createLink', url);
  };

  const buttons: { icon: React.ElementType; title: string; action: () => void; activeKey?: string }[] = [
    { icon: Bold, title: 'Bold', action: () => exec('bold'), activeKey: 'bold' },
    { icon: Italic, title: 'Italic', action: () => exec('italic'), activeKey: 'italic' },
    { icon: Underline, title: 'Underline', action: () => exec('underline'), activeKey: 'underline' },
    { icon: Heading2, title: 'Heading', action: () => exec('formatBlock', 'H2'), activeKey: 'h2' },
    { icon: Heading3, title: 'Subheading', action: () => exec('formatBlock', 'H3'), activeKey: 'h3' },
    { icon: List, title: 'Bullet list', action: () => exec('insertUnorderedList'), activeKey: 'insertUnorderedList' },
    { icon: ListOrdered, title: 'Numbered list', action: () => exec('insertOrderedList'), activeKey: 'insertOrderedList' },
    { icon: Quote, title: 'Quote', action: () => exec('formatBlock', 'BLOCKQUOTE'), activeKey: 'blockquote' },
    { icon: Link2, title: 'Insert link', action: addLink },
    { icon: Eraser, title: 'Clear formatting', action: () => { exec('removeFormat'); exec('formatBlock', 'P'); } },
  ];

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden focus-within:border-game-teal focus-within:ring-2 focus-within:ring-game-teal/20 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 bg-slate-50 border-b border-slate-200 px-2 py-1.5">
        {buttons.map(({ icon: Icon, title, action, activeKey }, i) => {
          const isActive = !!activeKey && active[activeKey];
          return (
            <React.Fragment key={title}>
              {(i === 3 || i === 5 || i === 8) && <span className="w-px h-5 bg-slate-200 mx-1" />}
              <button
                type="button"
                title={title}
                aria-label={title}
                aria-pressed={isActive}
                onMouseDown={(e) => e.preventDefault() /* keep selection in the editor */}
                onClick={action}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                  isActive
                    ? 'bg-game-teal text-white shadow-sm'
                    : 'text-slate-500 hover:bg-white hover:text-game-teal hover:shadow-sm'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => { emitChange(); refreshActive(); }}
        onBlur={emitChange}
        onKeyUp={refreshActive}
        onMouseUp={refreshActive}
        onFocus={refreshActive}
        data-placeholder={placeholder || 'Write your full article content here...'}
        className="rte-content min-h-[260px] max-h-[520px] overflow-y-auto px-4 py-3 text-sm text-slate-800 leading-relaxed focus:outline-none"
      />
    </div>
  );
};

export default RichTextEditor;
