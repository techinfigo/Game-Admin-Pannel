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

// --- Paste sanitising ------------------------------------------------------
// Pasted content (from Word, Google Docs, websites) carries inline fonts,
// colours and messy markup that make the blog look different from the site and
// can break links. We keep only plain semantic tags, drop every attribute
// except safe hrefs, and turn bare URLs into real clickable links.

const ALLOWED_TAGS = new Set(['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'A', 'H2', 'H3', 'UL', 'OL', 'LI', 'BLOCKQUOTE']);
const BLOCK_MAP: Record<string, string> = { DIV: 'P', H1: 'H2', H4: 'H3', H5: 'H3', H6: 'H3' };
const URL_RE = /((?:https?:\/\/|www\.)[^\s<]+[^\s<.,;:!?)])/gi;

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function linkifyEscaped(text: string): string {
  let out = '';
  let last = 0;
  let m: RegExpExecArray | null;
  URL_RE.lastIndex = 0;
  while ((m = URL_RE.exec(text))) {
    out += escapeHtml(text.slice(last, m.index));
    const raw = m[0];
    const href = raw.startsWith('www.') ? `https://${raw}` : raw;
    out += `<a href="${escapeAttr(href)}">${escapeHtml(raw)}</a>`;
    last = m.index + raw.length;
  }
  out += escapeHtml(text.slice(last));
  return out;
}

function cleanChildren(node: Node, insideAnchor: boolean): string {
  let out = '';
  node.childNodes.forEach((child) => {
    if (child.nodeType === 3 /* text */) {
      const text = child.nodeValue || '';
      out += insideAnchor ? escapeHtml(text) : linkifyEscaped(text);
      return;
    }
    if (child.nodeType !== 1 /* element */) return;
    const el = child as HTMLElement;
    let tag = BLOCK_MAP[el.tagName] || el.tagName;

    if (tag === 'A') {
      const href = el.getAttribute('href') || '';
      if (/^(https?:|mailto:|tel:)/i.test(href)) {
        out += `<a href="${escapeAttr(href)}">${cleanChildren(el, true)}</a>`;
      } else {
        out += cleanChildren(el, insideAnchor); // drop unsafe link, keep text
      }
      return;
    }
    if (ALLOWED_TAGS.has(tag)) {
      const t = tag.toLowerCase();
      out += `<${t}>${cleanChildren(el, insideAnchor)}</${t}>`;
    } else {
      out += cleanChildren(el, insideAnchor); // unwrap unknown tag, keep contents
    }
  });
  return out;
}

function sanitizePastedHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return cleanChildren(doc.body, false);
}

function plainTextToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((block) => `<p>${linkifyEscaped(block).replace(/\n/g, '<br>')}</p>`)
    .join('');
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

  // Clean up whatever is pasted so it inherits the site font and keeps links
  // clickable, instead of carrying Word/Docs/browser styling.
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    const cleaned = html ? sanitizePastedHtml(html) : plainTextToHtml(text);
    editorRef.current?.focus();
    // eslint-disable-next-line deprecation/deprecation
    document.execCommand('insertHTML', false, cleaned);
    emitChange();
    refreshActive();
  };

  const addLink = () => {
    // Keep the current selection so the prompt dialog doesn't lose it.
    const sel = window.getSelection();
    const saved = sel && sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;

    const url = window.prompt('Enter the link URL (include https://):', 'https://');
    if (!url || url === 'https://') return;
    const href = /^(https?:|mailto:|tel:)/i.test(url) ? url : `https://${url}`;

    editorRef.current?.focus();
    if (saved) {
      sel!.removeAllRanges();
      sel!.addRange(saved);
    }
    if (!saved || saved.collapsed) {
      // Nothing selected — drop the URL in as a fresh clickable link.
      // eslint-disable-next-line deprecation/deprecation
      document.execCommand('insertHTML', false, `<a href="${escapeAttr(href)}">${escapeHtml(url)}</a>`);
      emitChange();
      refreshActive();
    } else {
      exec('createLink', href);
    }
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
        onPaste={handlePaste}
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
