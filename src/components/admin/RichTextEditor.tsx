'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import MediaSelectModal from '@/components/admin/MediaSelectModal';
import { Link2, Search, Table2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { projectService } from '@/services/projectService';
import type { Media, Project } from '@/types/api';
import 'quill/dist/quill.snow.css';

type SavedRange = { index: number; length: number };

type TableModalState = {
  mode: 'insert' | 'edit';
  html: string;
  index: number | null;
};

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  enableProjectLinks?: boolean;
  stickyToolbar?: boolean;
  editorLabel?: string;
}

function sanitizeTableMarkup(value: string) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '')
    .replace(/\son\w+\s*=\s*(?:(["']).*?\1|[^\s>]+)/gi, '')
    .replace(/\sstyle\s*=\s*(?:(["']).*?\1|[^\s>]+)/gi, '')
    .replace(/\s(?:srcdoc|formaction)\s*=\s*(?:(["']).*?\1|[^\s>]+)/gi, '')
    .replace(/\s(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '')
    .replace(/\scontenteditable\s*=\s*(?:(["']).*?\1|[^\s>]+)/gi, '')
    .replace(/\sdata-table-selected\s*=\s*(?:(["']).*?\1|[^\s>]+)/gi, '')
    .replace(/\sclass\s*=\s*(["'])\s*\1/gi, '');
}

function extractTableMarkup(value: string) {
  const sanitized = sanitizeTableMarkup(value);
  return sanitized.match(/<table\b[^>]*>[\s\S]*?<\/table\s*>/i)?.[0] || '';
}

function createTableMarkup(rows: number, columns: number) {
  const safeRows = Math.min(20, Math.max(2, rows));
  const safeColumns = Math.min(10, Math.max(1, columns));
  const head = `<thead><tr>${Array.from({ length: safeColumns }, (_, index) => `<th>Cột ${index + 1}</th>`).join('')}</tr></thead>`;
  const body = `<tbody>${Array.from({ length: safeRows - 1 }, () => `<tr>${Array.from({ length: safeColumns }, () => '<td>Nội dung</td>').join('')}</tr>`).join('')}</tbody>`;
  return `<table>${head}${body}</table>`;
}

function serializeEditorHtml(quill: any) {
  const clone = quill.root.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.ql-multi-range-overlay').forEach((element) => element.remove());
  clone.querySelectorAll('.ql-article-table').forEach((wrapper) => {
    wrapper.replaceWith(...Array.from(wrapper.childNodes));
  });
  const html = clone.innerHTML;
  return html === '<p><br></p>' ? '' : html;
}

function mergeRanges(ranges: SavedRange[]) {
  const sorted = ranges
    .filter((range) => range.length > 0)
    .sort((a, b) => a.index - b.index || a.length - b.length);

  return sorted.reduce<SavedRange[]>((result, range) => {
    const previous = result[result.length - 1];
    if (!previous) return [range];
    const previousEnd = previous.index + previous.length;
    if (range.index <= previousEnd) {
      previous.length = Math.max(previousEnd, range.index + range.length) - previous.index;
      return result;
    }
    result.push(range);
    return result;
  }, []);
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  enableProjectLinks = false,
  stickyToolbar = false,
  editorLabel,
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarHostRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value);
  const isUpdatingRef = useRef(false);
  const isApplyingMultiFormatRef = useRef(false);
  const savedRangeRef = useRef<SavedRange | null>(null);
  const lastSelectionRef = useRef<SavedRange | null>(null);
  const savedRangesRef = useRef<SavedRange[]>([]);
  const selectedTableCellRef = useRef<HTMLTableCellElement | null>(null);
  const tableEditorRef = useRef<HTMLDivElement>(null);
  const highlightName = `ql-multi-${useId().replace(/:/g, '')}`;

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [tableModal, setTableModal] = useState<TableModalState | null>(null);
  const [tableRows, setTableRows] = useState(3);
  const [tableColumns, setTableColumns] = useState(3);
  const [activeHeading, setActiveHeading] = useState('');
  const [pastedImageStatus, setPastedImageStatus] = useState<'idle' | 'uploading' | 'error'>('idle');

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const applyHtmlToEditor = (quill: any, html: string) => {
    const normalizedHtml = html || '<p><br></p>';
    try {
      quill.clipboard.dangerouslyPasteHTML(normalizedHtml, 'silent');
    } catch {
      quill.root.innerHTML = normalizedHtml;
    }
  };

  const quillRangeToDomRange = (range: SavedRange) => {
    const quill = quillRef.current;
    if (!quill || range.length <= 0) return null;
    const resolveBoundary = (index: number) => {
      const safeIndex = Math.max(0, Math.min(index, quill.getLength() - 1));
      const [leaf, offset] = quill.getLeaf(safeIndex);
      const node = leaf?.domNode as Node | undefined;
      if (!node) return null;
      if (node.nodeType === Node.TEXT_NODE) {
        return { node, offset: Math.min(offset, node.textContent?.length || 0) };
      }
      return { node, offset: Math.min(offset, node.childNodes.length) };
    };
    const start = resolveBoundary(range.index);
    const end = resolveBoundary(range.index + range.length);
    if (!start || !end) return null;
    try {
      const domRange = document.createRange();
      domRange.setStart(start.node, start.offset);
      domRange.setEnd(end.node, end.offset);
      return domRange.collapsed ? null : domRange;
    } catch {
      return null;
    }
  };

  const clearRangeHighlight = () => {
    const cssHighlights = (window.CSS as typeof CSS & { highlights?: Map<string, unknown> })?.highlights;
    cssHighlights?.delete(highlightName);
    containerRef.current?.querySelector('.ql-multi-range-overlay')?.remove();
  };

  const refreshRangeHighlight = () => {
    clearRangeHighlight();
    if (savedRangesRef.current.length < 2) return;

    const domRanges = savedRangesRef.current
      .map(quillRangeToDomRange)
      .filter((range): range is Range => Boolean(range));
    const cssHighlights = (window.CSS as typeof CSS & { highlights?: Map<string, unknown> })?.highlights;
    const HighlightCtor = (window as typeof window & { Highlight?: new (...ranges: Range[]) => unknown }).Highlight;

    if (cssHighlights && HighlightCtor && domRanges.length) {
      cssHighlights.set(highlightName, new HighlightCtor(...domRanges));
      return;
    }

    if (!containerRef.current || !domRanges.length) return;
    const overlay = document.createElement('div');
    overlay.className = 'ql-multi-range-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    const bounds = containerRef.current.getBoundingClientRect();
    domRanges.forEach((domRange) => {
      Array.from(domRange.getClientRects()).forEach((rect) => {
        if (!rect.width || !rect.height) return;
        const marker = document.createElement('span');
        marker.className = 'ql-multi-range-overlay-marker';
        marker.style.left = `${rect.left - bounds.left}px`;
        marker.style.top = `${rect.top - bounds.top}px`;
        marker.style.width = `${rect.width}px`;
        marker.style.height = `${rect.height}px`;
        overlay.appendChild(marker);
      });
    });
    containerRef.current.appendChild(overlay);
  };

  const clearSavedRanges = () => {
    savedRangesRef.current = [];
    clearRangeHighlight();
  };

  const updateActiveHeadingForRanges = (ranges: SavedRange[]) => {
    const quill = quillRef.current;
    if (!quill || !ranges.length) return;
    const headings = ranges.map((range) => String(quill.getFormat(range.index, Math.max(1, range.length)).header || ''));
    setActiveHeading(headings.every((heading) => heading === headings[0]) ? headings[0] : 'mixed');
  };

  const setSavedRanges = (ranges: SavedRange[]) => {
    const merged = mergeRanges(ranges);
    savedRangesRef.current = merged;
    updateActiveHeadingForRanges(merged);
    refreshRangeHighlight();
  };

  const saveCurrentSelection = () => {
    const range = quillRef.current?.getSelection();
    if (range) lastSelectionRef.current = { index: range.index, length: range.length };
  };

  const applyHeadingFormat = (value: string) => {
    const quill = quillRef.current;
    if (!quill) return;
    const headerValue = ['1', '2', '3', '4', '5'].includes(value) ? Number(value) : false;
    const ranges = savedRangesRef.current;
    const currentRange = quill.getSelection() || lastSelectionRef.current || ranges[0] || null;

    isApplyingMultiFormatRef.current = true;
    try {
      if (ranges.length > 1) {
        ranges.forEach((range) => {
          quill.formatLine(range.index, Math.max(1, range.length), 'header', headerValue, 'user');
        });
        updateActiveHeadingForRanges(ranges);
        refreshRangeHighlight();
      } else if (currentRange) {
        quill.formatLine(currentRange.index, Math.max(1, currentRange.length), 'header', headerValue, 'user');
        lastSelectionRef.current = currentRange;
        quill.setSelection(currentRange.index, currentRange.length, 'silent');
        setActiveHeading(headerValue === false ? '' : String(headerValue));
      }
      onChangeRef.current(serializeEditorHtml(quill));
    } finally {
      isApplyingMultiFormatRef.current = false;
    }
    quill.focus();
  };

  const applyToolbarFormat = (format: string, formatValue: unknown) => {
    const quill = quillRef.current;
    if (!quill) return;
    const ranges = savedRangesRef.current;
    if (ranges.length < 2) {
      const current = quill.getSelection() || lastSelectionRef.current || ranges[0] || null;
      if (format === 'clean') {
        if (current) quill.removeFormat(current.index, current.length, 'user');
      } else if (current) {
        if (format === 'align' || format === 'list') {
          quill.formatLine(current.index, Math.max(1, current.length), format, formatValue, 'user');
        } else {
          quill.formatText(current.index, current.length, format, formatValue, 'user');
        }
      }
      return;
    }

    isApplyingMultiFormatRef.current = true;
    try {
      ranges.forEach((range) => {
        if (format === 'align' || format === 'list') {
          quill.formatLine(range.index, Math.max(1, range.length), format, formatValue, 'user');
        } else if (format === 'clean') {
          quill.removeFormat(range.index, range.length, 'user');
        } else {
          quill.formatText(range.index, range.length, format, formatValue, 'user');
        }
      });
      onChangeRef.current(serializeEditorHtml(quill));
      refreshRangeHighlight();
    } finally {
      isApplyingMultiFormatRef.current = false;
    }
  };

  const openTableForInsert = () => {
    const quill = quillRef.current;
    if (!quill) return;
    const range = quill.getSelection(true) || { index: Math.max(0, quill.getLength() - 1), length: 0 };
    savedRangeRef.current = range;
    setTableRows(3);
    setTableColumns(3);
    setTableModal({ mode: 'insert', html: createTableMarkup(3, 3), index: null });
  };

  const rebuildTableDraft = () => {
    setTableModal((current) => current ? { ...current, html: createTableMarkup(tableRows, tableColumns) } : current);
  };

  const selectTableCell = (cell: HTMLTableCellElement | null) => {
    selectedTableCellRef.current?.removeAttribute('data-table-selected');
    selectedTableCellRef.current = cell;
    cell?.setAttribute('data-table-selected', 'true');
  };

  const tableRowsInEditor = () => Array.from(tableEditorRef.current?.querySelectorAll('tr') || []);

  const addTableRow = () => {
    const selected = selectedTableCellRef.current;
    const rows = tableRowsInEditor();
    const referenceRow = selected?.closest('tr') || rows[rows.length - 1];
    if (!referenceRow || rows.length >= 20) return;
    const logicalColumns = Math.max(1, ...rows.map((row) => Array.from(row.cells).reduce((total, cell) => total + Math.max(1, cell.colSpan || 1), 0)));
    const newRow = document.createElement('tr');
    Array.from({ length: logicalColumns }, () => {
      const cell = document.createElement('td');
      cell.textContent = 'Nội dung';
      cell.contentEditable = 'true';
      newRow.appendChild(cell);
    });
    referenceRow.after(newRow);
    selectTableCell(newRow.cells[0]);
  };

  const deleteTableRow = () => {
    const row = selectedTableCellRef.current?.closest('tr');
    const rows = tableRowsInEditor();
    if (!row || rows.length <= 1) return;
    row.remove();
    selectTableCell(null);
  };

  const selectedLogicalColumn = () => {
    const selected = selectedTableCellRef.current;
    if (!selected) return -1;
    let column = 0;
    for (const cell of Array.from(selected.parentElement?.children || [])) {
      if (cell === selected) return column;
      column += Math.max(1, (cell as HTMLTableCellElement).colSpan || 1);
    }
    return -1;
  };

  const cellAtLogicalColumn = (row: HTMLTableRowElement, column: number) => {
    let offset = 0;
    for (const cell of Array.from(row.cells)) {
      const span = Math.max(1, cell.colSpan || 1);
      if (column >= offset && column < offset + span) return { cell, offset, span };
      offset += span;
    }
    return { cell: null, offset, span: 0 };
  };

  const addTableColumn = () => {
    const column = selectedLogicalColumn();
    const rows = tableRowsInEditor();
    if (column < 0 || !rows.length) return;
    const maxColumns = Math.max(...rows.map((row) => Array.from(row.cells).reduce((total, cell) => total + Math.max(1, cell.colSpan || 1), 0)));
    if (maxColumns >= 10) return;
    rows.forEach((row) => {
      const match = cellAtLogicalColumn(row, column);
      const tagName = match.cell?.tagName === 'TH' ? 'th' : 'td';
      const cell = document.createElement(tagName) as HTMLTableCellElement;
      cell.textContent = tagName === 'th' ? `Cột ${maxColumns + 1}` : 'Nội dung';
      cell.contentEditable = 'true';
      match.cell?.after(cell);
    });
  };

  const deleteTableColumn = () => {
    const column = selectedLogicalColumn();
    const rows = tableRowsInEditor();
    if (column < 0 || !rows.length) return;
    const maxColumns = Math.max(...rows.map((row) => Array.from(row.cells).reduce((total, cell) => total + Math.max(1, cell.colSpan || 1), 0)));
    if (maxColumns <= 1) return;
    rows.forEach((row) => {
      const match = cellAtLogicalColumn(row, column);
      if (!match.cell) return;
      if (match.span > 1) match.cell.colSpan = match.span - 1;
      else match.cell.remove();
    });
    selectTableCell(null);
  };

  const applyTableCellFormat = (command: 'bold' | 'italic') => {
    tableEditorRef.current?.focus();
    document.execCommand(command, false);
  };

  const saveTableModal = () => {
    const quill = quillRef.current;
    const root = tableEditorRef.current;
    if (!quill || !root || !tableModal) return;
    const clone = root.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('th,td').forEach((cell) => {
      cell.removeAttribute('contenteditable');
      cell.removeAttribute('spellcheck');
      cell.removeAttribute('data-table-selected');
    });
    const html = extractTableMarkup(clone.innerHTML);
    if (!html) return;

    clearSavedRanges();
    if (tableModal.mode === 'edit' && tableModal.index !== null) {
      quill.deleteText(tableModal.index, 1, 'user');
      quill.insertEmbed(tableModal.index, 'articleTable', html, 'user');
      quill.setSelection(tableModal.index + 1, 0, 'silent');
    } else {
      const range = savedRangeRef.current || { index: Math.max(0, quill.getLength() - 1), length: 0 };
      quill.deleteText(range.index, range.length, 'user');
      quill.insertEmbed(range.index, 'articleTable', html, 'user');
      quill.insertText(range.index + 1, '\n', 'user');
      quill.setSelection(range.index + 2, 0, 'silent');
    }
    onChangeRef.current(serializeEditorHtml(quill));
    selectTableCell(null);
    setTableModal(null);
  };

  const deleteCurrentTable = () => {
    const quill = quillRef.current;
    if (!quill || !tableModal || tableModal.mode !== 'edit' || tableModal.index === null) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ bảng này khỏi bài viết?')) return;

    const tableIndex = tableModal.index;
    quill.deleteText(tableIndex, 1, 'user');
    if (quill.getLength() <= 1) {
      quill.insertText(0, '\n', 'user');
      quill.setSelection(0, 0, 'silent');
    } else {
      quill.setSelection(Math.min(tableIndex, Math.max(0, quill.getLength() - 1)), 0, 'silent');
    }
    onChangeRef.current(serializeEditorHtml(quill));
    selectTableCell(null);
    setTableModal(null);
  };

  useEffect(() => {
    let active = true;

    async function initQuill() {
      if (typeof window === 'undefined') return;
      try {
        const Quill = (await import('quill')).default;
        const Delta = Quill.import('delta') as any;
        const BlockEmbed = Quill.import('blots/block/embed') as any;

        class ArticleTableBlot extends BlockEmbed {
          static blotName = 'articleTable';
          static tagName = 'div';
          static className = 'ql-article-table';
          static create(tableHtml: string) {
            const node = super.create() as HTMLElement;
            node.setAttribute('contenteditable', 'false');
            node.setAttribute('role', 'button');
            node.setAttribute('tabindex', '0');
            node.setAttribute('aria-label', 'Bảng dữ liệu. Nhấp để chỉnh sửa');
            node.setAttribute('title', 'Nhấp để chỉnh sửa bảng');
            node.innerHTML = extractTableMarkup(tableHtml);
            return node;
          }
          static value(node: HTMLElement) {
            return extractTableMarkup(node.innerHTML);
          }
        }
        Quill.register(ArticleTableBlot, true);

        if (!active || !containerRef.current || quillRef.current) return;
        const editorContainer = document.createElement('div');
        containerRef.current.appendChild(editorContainer);
        const quill = new Quill(editorContainer, {
          theme: 'snow',
          placeholder: placeholder || 'Nhập nội dung bài viết/dự án...',
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline', 'strike'],
              [{ color: [] }, { background: [] }],
              [{ list: 'ordered' }, { list: 'bullet' }],
              [{ align: [] }],
              ['link', 'image', 'video'],
              ['clean'],
            ],
          },
        });
        quill.clipboard.addMatcher('TABLE', (node: Node) => (
          new Delta().insert({ articleTable: extractTableMarkup((node as HTMLElement).outerHTML) })
        ));
        quillRef.current = quill;

        const toolbar = quill.getModule('toolbar') as any;
        const toolbarElement = containerRef.current.querySelector('.ql-toolbar');
        if (toolbarElement && toolbarHostRef.current) toolbarHostRef.current.appendChild(toolbarElement);
        if (toolbar) {
          toolbar.addHandler('image', () => setIsMediaModalOpen(true));
          ['bold', 'italic', 'underline', 'strike', 'color', 'background', 'align', 'list'].forEach((format) => {
            toolbar.addHandler(format, (formatValue: unknown) => applyToolbarFormat(format, formatValue));
          });
          toolbar.addHandler('clean', () => applyToolbarFormat('clean', false));
        }

        if (initialValueRef.current) applyHtmlToEditor(quill, initialValueRef.current);

        quill.on('text-change', (_delta: unknown, _old: unknown, source: string) => {
          if (!isUpdatingRef.current) onChangeRef.current(serializeEditorHtml(quill));
          if (source === 'user' && !isApplyingMultiFormatRef.current) clearSavedRanges();
        });
        quill.on('selection-change', (range: SavedRange | null) => {
          if (!range) return;
          lastSelectionRef.current = { index: range.index, length: range.length };
          if (savedRangesRef.current.length > 1) updateActiveHeadingForRanges(savedRangesRef.current);
          else setActiveHeading(String(quill.getFormat(range).header || ''));
        });

        let additiveStartIndex: number | null = null;
        const indexFromPoint = (x: number, y: number) => {
          const caretRange = document.caretRangeFromPoint?.(x, y);
          if (!caretRange || !quill.root.contains(caretRange.startContainer)) return null;
          const blot = Quill.find(caretRange.startContainer, true);
          if (!blot) return null;
          return quill.getIndex(blot as any) + caretRange.startOffset;
        };
        const handleMouseDown = (event: MouseEvent) => {
          if (!event.ctrlKey && !event.metaKey) {
            additiveStartIndex = null;
            return;
          }
          const startIndex = indexFromPoint(event.clientX, event.clientY);
          if (startIndex === null) return;
          additiveStartIndex = startIndex;
          event.preventDefault();
        };
        const handleMouseUp = (event: MouseEvent) => {
          const tableWrapper = (event.target as HTMLElement).closest('.ql-article-table') as HTMLElement | null;
          if (tableWrapper) {
            const blot = Quill.find(tableWrapper);
            if (blot) {
              const index = quill.getIndex(blot as any);
              setTableRows(tableWrapper.querySelectorAll('tr').length || 2);
              setTableColumns(Math.max(1, ...Array.from(tableWrapper.querySelectorAll('tr')).map((row) => Array.from(row.children).reduce((total, cell) => total + Math.max(1, Number((cell as HTMLElement).getAttribute('colspan') || 1)), 0))));
              setTableModal({ mode: 'edit', html: extractTableMarkup(tableWrapper.innerHTML), index });
            }
            return;
          }

          const additive = event.ctrlKey || event.metaKey;
          if (additive && additiveStartIndex !== null) {
            const endIndex = indexFromPoint(event.clientX, event.clientY);
            if (endIndex !== null && endIndex !== additiveStartIndex) {
              setSavedRanges([
                ...savedRangesRef.current,
                { index: Math.min(additiveStartIndex, endIndex), length: Math.abs(endIndex - additiveStartIndex) },
              ]);
            }
            additiveStartIndex = null;
            window.getSelection()?.removeAllRanges();
            return;
          }
          requestAnimationFrame(() => {
            const range = quill.getSelection();
            if (range?.length) {
              setSavedRanges(additive ? [...savedRangesRef.current, range] : [range]);
              if (additive) window.getSelection()?.removeAllRanges();
            } else if (!additive) {
              clearSavedRanges();
            }
          });
        };
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') clearSavedRanges();
          const target = event.target as HTMLElement;
          if ((event.key === 'Enter' || event.key === ' ' || event.key === 'Delete' || event.key === 'Backspace') && target.classList.contains('ql-article-table')) {
            event.preventDefault();
            target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
          }
        };
        const handleDragStart = (event: DragEvent) => {
          if (event.ctrlKey || event.metaKey || additiveStartIndex !== null) event.preventDefault();
        };
        const handlePaste = async (event: ClipboardEvent) => {
          const imageItems = Array.from(event.clipboardData?.items || [])
            .filter((item) => item.kind === 'file' && item.type.startsWith('image/'));
          if (!imageItems.length) return;

          event.preventDefault();
          const selection = quill.getSelection() || lastSelectionRef.current || { index: Math.max(0, quill.getLength() - 1), length: 0 };
          let insertAt = selection.index;
          setPastedImageStatus('uploading');

          try {
            if (selection.length > 0) quill.deleteText(selection.index, selection.length, 'user');
            for (const [imageIndex, item] of imageItems.entries()) {
              const source = item.getAsFile();
              if (!source) continue;
              const extension = source.type.split('/')[1] || 'png';
              const file = new File([source], `anh-dan-${Date.now()}-${imageIndex + 1}.${extension}`, { type: source.type });
              const response = await api.upload<Media>('/media/upload', file);
              if (!response.data?.url) throw new Error('Media Library không trả về URL ảnh.');
              quill.insertEmbed(insertAt, 'image', response.data.url, 'user');
              insertAt += 1;
              quill.insertText(insertAt, '\n', 'user');
              insertAt += 1;
            }
            quill.setSelection(insertAt, 0, 'silent');
            onChangeRef.current(serializeEditorHtml(quill));
            setPastedImageStatus('idle');
          } catch (error) {
            console.error('Failed to upload pasted image:', error);
            setPastedImageStatus('error');
          }
        };
        const handleResize = () => refreshRangeHighlight();
        quill.root.addEventListener('mousedown', handleMouseDown);
        quill.root.addEventListener('mouseup', handleMouseUp);
        quill.root.addEventListener('keydown', handleKeyDown);
        quill.root.addEventListener('dragstart', handleDragStart);
        quill.root.addEventListener('paste', handlePaste);
        window.addEventListener('resize', handleResize);
        (quill as any).__articleCleanup = () => {
          quill.root.removeEventListener('mousedown', handleMouseDown);
          quill.root.removeEventListener('mouseup', handleMouseUp);
          quill.root.removeEventListener('keydown', handleKeyDown);
          quill.root.removeEventListener('dragstart', handleDragStart);
          quill.root.removeEventListener('paste', handlePaste);
          window.removeEventListener('resize', handleResize);
        };
      } catch (error) {
        console.error('Error initializing Quill editor:', error);
      }
    }

    initQuill();
    return () => {
      active = false;
      clearRangeHighlight();
      if (quillRef.current) {
        quillRef.current.__articleCleanup?.();
        quillRef.current = null;
      }
      if (containerRef.current) containerRef.current.innerHTML = '';
      if (toolbarHostRef.current) toolbarHostRef.current.innerHTML = '';
    };
  }, []);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill || quill.hasFocus()) return;
    const currentValue = serializeEditorHtml(quill);
    const normalizedValue = value || '';
    if (currentValue !== normalizedValue) {
      isUpdatingRef.current = true;
      applyHtmlToEditor(quill, normalizedValue);
      isUpdatingRef.current = false;
    }
  }, [value]);

  useEffect(() => {
    if (!tableModal || !tableEditorRef.current) return;
    tableEditorRef.current.innerHTML = extractTableMarkup(tableModal.html);
    tableEditorRef.current.querySelectorAll('th,td').forEach((cell) => {
      cell.setAttribute('contenteditable', 'true');
      cell.setAttribute('spellcheck', 'true');
    });
    selectTableCell(tableEditorRef.current.querySelector('th,td'));
  }, [tableModal]);

  useEffect(() => {
    if (!isProjectModalOpen) return;
    let active = true;
    projectService.getProjects({ per_page: '100', sort_by: 'name', sort_order: 'asc' })
      .then((items) => {
        if (active) setProjects(items.filter((item) => item.is_published && Boolean(item.slug)));
      })
      .catch(() => {
        if (active) setProjects([]);
      })
      .finally(() => {
        if (active) setIsLoadingProjects(false);
      });
    return () => { active = false; };
  }, [isProjectModalOpen]);

  const handleMediaSelect = (url: string | string[]) => {
    const imageUrl = Array.isArray(url) ? url[0] : url;
    const quill = quillRef.current;
    if (!imageUrl || !quill) return;
    const range = quill.getSelection() || { index: quill.getLength(), length: 0 };
    quill.insertEmbed(range.index, 'image', imageUrl, 'user');
    quill.setSelection(range.index + 1, 0, 'silent');
  };

  const openProjectLinkModal = () => {
    const quill = quillRef.current;
    if (!quill) return;
    savedRangeRef.current = quill.getSelection() || { index: Math.max(0, quill.getLength() - 1), length: 0 };
    setProjectSearch('');
    setIsLoadingProjects(true);
    setIsProjectModalOpen(true);
  };

  const insertProjectLink = (project: Project) => {
    const quill = quillRef.current;
    const range = savedRangeRef.current;
    if (!quill || !range || !project.slug) return;
    const href = `/du-an/${project.slug}`;
    const selectedText = range.length > 0 ? quill.getText(range.index, range.length).trim() : '';
    if (range.length > 0 && selectedText) {
      quill.formatText(range.index, range.length, 'link', href, 'user');
      quill.setSelection(range.index + range.length, 0, 'silent');
    } else {
      quill.insertText(range.index, project.name, 'link', href, 'user');
      quill.setSelection(range.index + project.name.length, 0, 'silent');
    }
    setIsProjectModalOpen(false);
  };

  const normalizedSearch = projectSearch.trim().toLocaleLowerCase('vi-VN');
  const filteredProjects = projects.filter((project) => (
    !normalizedSearch || `${project.name} ${project.location || ''}`.toLocaleLowerCase('vi-VN').includes(normalizedSearch)
  ));

  return (
    <div className="rich-text-editor-wrapper">
      <div className={`rich-text-editor-sticky-tools ${stickyToolbar ? 'is-sticky' : ''}`}>
        <div className="rich-text-editor-custom-tools">
          {editorLabel ? <span className="mr-auto text-[11px] font-black uppercase tracking-[0.08em] text-[#8F632F]">{editorLabel}</span> : null}
          <label className="inline-flex items-center gap-2 text-[11px] font-bold text-[#6E5F51]">
            <span className="sr-only">Định dạng tiêu đề</span>
            <select
              aria-label="Định dạng tiêu đề"
              value={activeHeading}
              onMouseDown={saveCurrentSelection}
              onChange={(event) => applyHeadingFormat(event.target.value)}
              className="h-9 min-w-[138px] rounded-lg border border-[#E8DCCB] bg-white px-3 text-xs font-bold text-[#4B4238] outline-none focus:border-[#B88746] focus:ring-2 focus:ring-[#B88746]/20"
            >
              {activeHeading === 'mixed' ? <option value="mixed" disabled>Nhiều định dạng</option> : null}
              <option value="">Đoạn thường</option>
              <option value="1">Heading 1</option>
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
              <option value="4">Heading 4</option>
              <option value="5">Heading 5</option>
            </select>
          </label>
          {enableProjectLinks ? (
            <button type="button" onClick={openProjectLinkModal} className="inline-flex items-center gap-2 rounded-lg border border-[#B88746]/50 bg-[#FFF9F0] px-3 py-2 text-xs font-bold text-[#8F632F] transition hover:border-[#B88746] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B88746]/40">
              <Link2 className="h-4 w-4" /> Chèn liên kết dự án
            </button>
          ) : null}
          <button type="button" onClick={openTableForInsert} className="inline-flex items-center gap-2 rounded-lg border border-[#E8DCCB] bg-white px-3 py-2 text-xs font-bold text-[#6E5F51] hover:border-[#B88746] hover:text-[#8F632F]">
            <Table2 className="h-4 w-4" /> Chèn bảng
          </button>
        </div>
        <div ref={toolbarHostRef} className="rich-text-editor-toolbar-host" />
        {pastedImageStatus === 'uploading' ? <p className="px-3 pb-2 text-xs font-semibold text-[#8F632F]">Đang tải ảnh dán vào Media Library...</p> : null}
        {pastedImageStatus === 'error' ? <p className="px-3 pb-2 text-xs font-semibold text-red-600">Không thể tải ảnh dán. Vui lòng chọn ảnh từ Media Library.</p> : null}
      </div>

      <div ref={containerRef} className="quill-editor-container" />

      <MediaSelectModal isOpen={isMediaModalOpen} onClose={() => setIsMediaModalOpen(false)} onSelect={handleMediaSelect} multiple={false} />

      {tableModal ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-3 sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setTableModal(null); }}>
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#E8DCCB] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#E8DCCB] px-4 py-4 sm:px-5">
              <div>
                <h3 className="text-base font-black text-[#1F1B16]">{tableModal.mode === 'insert' ? 'Chèn bảng vào bài viết' : 'Chỉnh sửa bảng'}</h3>
                <p className="mt-1 text-xs text-[#8C7A6B]">Chọn một ô để sửa nội dung, thêm/xóa hàng hoặc cột. Bảng chỉ được cập nhật vào bài khi bấm Lưu bảng.</p>
              </div>
              <button type="button" aria-label="Đóng trình sửa bảng" onClick={() => setTableModal(null)} className="rounded-full p-2 text-[#8C7A6B] hover:bg-[#FBF8F2]"><X className="h-4 w-4" /></button>
            </div>

            <div className="flex flex-wrap items-end gap-2 border-b border-[#E8DCCB] bg-[#FBF8F2] px-4 py-3 sm:px-5">
              {tableModal.mode === 'insert' ? (
                <>
                  <label className="text-[11px] font-bold text-[#6E5F51]">Hàng<input type="number" min={2} max={20} value={tableRows} onChange={(event) => setTableRows(Math.min(20, Math.max(2, Number(event.target.value) || 2)))} className="ml-2 h-9 w-16 rounded-lg border border-[#E8DCCB] bg-white px-2 text-sm" /></label>
                  <label className="text-[11px] font-bold text-[#6E5F51]">Cột<input type="number" min={1} max={10} value={tableColumns} onChange={(event) => setTableColumns(Math.min(10, Math.max(1, Number(event.target.value) || 1)))} className="ml-2 h-9 w-16 rounded-lg border border-[#E8DCCB] bg-white px-2 text-sm" /></label>
                  <button type="button" onClick={rebuildTableDraft} className="h-9 rounded-lg border border-[#B88746] bg-white px-3 text-xs font-bold text-[#8F632F]">Tạo lại bảng</button>
                </>
              ) : null}
              <span className="hidden h-7 w-px bg-[#D8C8B3] sm:block" />
              <button type="button" onMouseDown={(event) => { event.preventDefault(); applyTableCellFormat('bold'); }} className="h-9 rounded-lg border border-[#E8DCCB] bg-white px-3 text-sm font-black">B</button>
              <button type="button" onMouseDown={(event) => { event.preventDefault(); applyTableCellFormat('italic'); }} className="h-9 rounded-lg border border-[#E8DCCB] bg-white px-3 text-sm font-bold italic">I</button>
              <button type="button" onClick={addTableRow} className="h-9 rounded-lg border border-[#E8DCCB] bg-white px-3 text-xs font-bold">+ Hàng</button>
              <button type="button" onClick={deleteTableRow} className="h-9 rounded-lg border border-red-200 bg-white px-3 text-xs font-bold text-red-600">− Hàng</button>
              <button type="button" onClick={addTableColumn} className="h-9 rounded-lg border border-[#E8DCCB] bg-white px-3 text-xs font-bold">+ Cột</button>
              <button type="button" onClick={deleteTableColumn} className="h-9 rounded-lg border border-red-200 bg-white px-3 text-xs font-bold text-red-600">− Cột</button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-5">
              <div ref={tableEditorRef} onClick={(event) => selectTableCell((event.target as HTMLElement).closest('th,td') as HTMLTableCellElement | null)} className="table-modal-editor min-w-max" />
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[#E8DCCB] bg-white px-4 py-3 sm:px-5">
              <div>{tableModal.mode === 'edit' ? <button type="button" onClick={deleteCurrentTable} className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-xs font-black text-red-700 hover:bg-red-100">Xóa bảng</button> : null}</div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setTableModal(null)} className="rounded-xl border border-[#E8DCCB] px-4 py-2 text-xs font-bold text-[#6E5F51]">Hủy</button>
                <button type="button" onClick={saveTableModal} className="rounded-xl bg-[#B88746] px-5 py-2 text-xs font-black text-white">Lưu bảng</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isProjectModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4" onMouseDown={() => setIsProjectModalOpen(false)}>
          <div className="w-full max-w-xl rounded-2xl border border-[#E8DCCB] bg-white p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-4">
              <div><h3 className="text-base font-bold text-[#1F1B16]">Chèn liên kết dự án</h3><p className="mt-1 text-xs text-[#8C7A6B]">Chọn dự án đã xuất bản để tạo đường dẫn nội bộ.</p></div>
              <button type="button" aria-label="Đóng" onClick={() => setIsProjectModalOpen(false)} className="rounded-full p-2 text-[#8C7A6B] hover:bg-[#FBF8F2]"><X className="h-4 w-4" /></button>
            </div>
            <label className="mt-4 flex items-center gap-2 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] px-3 focus-within:border-[#B88746]">
              <Search className="h-4 w-4 text-[#B88746]" />
              <input autoFocus value={projectSearch} onChange={(event) => setProjectSearch(event.target.value)} placeholder="Tìm theo tên hoặc vị trí dự án..." className="h-11 w-full bg-transparent text-sm text-[#1F1B16] outline-none" />
            </label>
            <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
              {isLoadingProjects ? <p className="py-8 text-center text-sm text-[#8C7A6B]">Đang tải dự án...</p> : filteredProjects.length ? filteredProjects.map((project) => (
                <button key={project.id} type="button" onClick={() => insertProjectLink(project)} className="block w-full rounded-xl border border-[#E8DCCB]/70 px-4 py-3 text-left transition hover:border-[#B88746] hover:bg-[#FFF9F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B88746]/40">
                  <span className="block text-sm font-bold text-[#1F1B16]">{project.name}</span>
                  <span className="mt-1 block text-xs text-[#8C7A6B]">{project.location || `/du-an/${project.slug}`}</span>
                </button>
              )) : <p className="py-8 text-center text-sm text-[#8C7A6B]">Không tìm thấy dự án phù hợp.</p>}
            </div>
          </div>
        </div>
      ) : null}

      <style dangerouslySetInnerHTML={{ __html: `
        .rich-text-editor-wrapper { position: relative; min-width: 0; }
        .rich-text-editor-sticky-tools { width: 100%; max-width: 100%; background: #fff; }
        .rich-text-editor-sticky-tools.is-sticky { position: sticky; top: 0; z-index: 24; padding-top: 4px; box-shadow: 0 8px 18px rgba(31,27,22,.07); }
        .rich-text-editor-custom-tools { display: flex; min-width: 0; flex-wrap: wrap; align-items: center; gap: 8px; padding: 0 0 8px; background: #fff; }
        .rich-text-editor-toolbar-host { min-width: 0; max-width: 100%; overflow-x: auto; overscroll-behavior-inline: contain; }
        .rich-text-editor-wrapper .ql-toolbar.ql-snow { display: flex; min-width: max-content; flex-wrap: wrap; border: 1px solid #E8DCCB !important; border-radius: 12px 12px 0 0 !important; background-color: #FBF8F2 !important; padding: 8px 12px !important; }
        .rich-text-editor-wrapper .ql-container.ql-snow { border: 1px solid #E8DCCB !important; border-top: none !important; border-radius: 0 0 12px 12px !important; background-color: #fff !important; min-height: 280px !important; font-family: inherit !important; font-size: 14px !important; }
        .rich-text-editor-wrapper .ql-editor { min-height: 280px !important; color: #1F1B16 !important; line-height: 1.6 !important; }
        .rich-text-editor-wrapper .ql-editor table { width: 100%; min-width: 620px; border-collapse: collapse; margin: 1rem 0; background: #fff; }
        .rich-text-editor-wrapper .ql-editor th, .rich-text-editor-wrapper .ql-editor td { border: 1px solid #E8DCCB; padding: 8px 10px; text-align: left; vertical-align: top; }
        .rich-text-editor-wrapper .ql-editor thead th { background: #FBF8F2; color: #1F1B16; font-weight: 700; }
        .rich-text-editor-wrapper .ql-container { overflow-x: auto; }
        .rich-text-editor-wrapper .ql-article-table { position: relative; max-width: 100%; overflow-x: auto; border-radius: 12px; outline: none; cursor: pointer; }
        .rich-text-editor-wrapper .ql-article-table:hover, .rich-text-editor-wrapper .ql-article-table:focus-visible { box-shadow: 0 0 0 2px rgba(184,135,70,.45); }
        .rich-text-editor-wrapper .ql-article-table::after { content: 'Nhấp để chỉnh sửa bảng'; position: sticky; right: 8px; bottom: 8px; float: right; margin: -38px 8px 8px 0; border-radius: 999px; background: #1F1B16; color: #fff; padding: 5px 9px; font-size: 10px; font-weight: 700; pointer-events: none; }
        ::highlight(${highlightName}) { color: inherit; background: rgba(184,135,70,.28); text-decoration: underline 2px rgba(143,99,47,.7); }
        .rich-text-editor-wrapper .quill-editor-container { position: relative; min-width: 0; }
        .rich-text-editor-wrapper .ql-multi-range-overlay { position: absolute; inset: 0; z-index: 2; pointer-events: none; overflow: hidden; }
        .rich-text-editor-wrapper .ql-multi-range-overlay-marker { position: absolute; border-bottom: 2px solid rgba(143,99,47,.75); background: rgba(184,135,70,.28); border-radius: 2px; }
        .rich-text-editor-wrapper .ql-editor.ql-blank::before { color: #8C7A6B !important; opacity: .6 !important; font-style: normal !important; }
        .table-modal-editor table { min-width: 680px; width: 100%; border-collapse: collapse; background: #fff; }
        .table-modal-editor th, .table-modal-editor td { min-width: 130px; border: 1px solid #CDBB9F; padding: 10px 12px; text-align: left; vertical-align: top; outline: none; white-space: normal; overflow-wrap: anywhere; }
        .table-modal-editor th { background: #FBF8F2; font-weight: 800; }
        .table-modal-editor [data-table-selected="true"] { box-shadow: inset 0 0 0 2px #B88746; background: #FFF9F0; }
        @media (max-width: 640px) {
          .rich-text-editor-sticky-tools.is-sticky { margin-inline: -2px; width: calc(100% + 4px); }
          .rich-text-editor-custom-tools > span { width: 100%; }
          .rich-text-editor-wrapper .ql-toolbar.ql-snow { flex-wrap: nowrap; }
        }
      `}} />
    </div>
  );
}
