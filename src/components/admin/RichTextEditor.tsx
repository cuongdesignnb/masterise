'use client';

import React, { useEffect, useRef, useState } from 'react';
import MediaSelectModal from '@/components/admin/MediaSelectModal';
import { Copy, Eraser, Link2, MousePointer2, Search, Table2, Trash2, X } from 'lucide-react';
import { projectService } from '@/services/projectService';
import type { Project } from '@/types/api';
import 'quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  enableProjectLinks?: boolean;
}

function sanitizeTableMarkup(value: string) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
    .replace(/\son\w+\s*=\s*(["']).*?\1/gi, '')
    .replace(/\s(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '');
}

function serializeEditorHtml(quill: any) {
  const clone = quill.root.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.ql-multi-selected').forEach((element) => {
    element.classList.remove('ql-multi-selected');
    element.removeAttribute('data-multi-selected');
  });
  clone.querySelectorAll('.ql-article-table').forEach((wrapper) => {
    wrapper.replaceWith(...Array.from(wrapper.childNodes));
  });
  const html = clone.innerHTML;
  return html === '<p><br></p>' ? '' : html;
}

export default function RichTextEditor({ value, onChange, placeholder, enableProjectLinks = false }: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const isUpdatingRef = useRef<boolean>(false);
  const savedRangeRef = useRef<{ index: number; length: number } | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const selectedBlocksRef = useRef<Set<HTMLElement>>(new Set());
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedBlockCount, setSelectedBlockCount] = useState(0);
  const tableInputHandlerRef = useRef<((event: Event) => void) | null>(null);

  const applyHtmlToEditor = (quill: any, html: string) => {
    const normalizedHtml = html || '<p><br></p>';
    try {
      quill.clipboard.dangerouslyPasteHTML(normalizedHtml, 'silent');
    } catch {
      quill.root.innerHTML = normalizedHtml;
    }
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
          static create(value: string) {
            const node = super.create() as HTMLElement;
            node.setAttribute('contenteditable', 'true');
            node.setAttribute('role', 'region');
            node.setAttribute('aria-label', 'Bảng dữ liệu trong bài viết');
            node.innerHTML = sanitizeTableMarkup(value);
            return node;
          }
          static value(node: HTMLElement) {
            return node.innerHTML;
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
              [{ header: [1, 2, 3, 4, 5, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ color: [] }, { background: [] }],
              [{ list: 'ordered' }, { list: 'bullet' }],
              [{ align: [] }],
              ['link', 'image', 'video'],
              ['clean']
            ]
          }
        });
        quill.clipboard.addMatcher('TABLE', (node: Node) => (
          new Delta().insert({ articleTable: sanitizeTableMarkup((node as HTMLElement).outerHTML) })
        ));

        quillRef.current = quill;

        // Override the image handler to open our premium MediaSelectModal
        const toolbar = quill.getModule('toolbar') as any;
        if (toolbar) {
          toolbar.addHandler('image', () => {
            setIsMediaModalOpen(true);
          });
        }

        // Set initial value
        if (value) {
          applyHtmlToEditor(quill, value);
        }

        // Handle changes
        quill.on('text-change', () => {
          if (!isUpdatingRef.current) {
            onChange(serializeEditorHtml(quill));
          }
        });
        const handleTableInput = (event: Event) => {
          if ((event.target as HTMLElement).closest('.ql-article-table') && !isUpdatingRef.current) {
            onChange(serializeEditorHtml(quill));
          }
        };
        tableInputHandlerRef.current = handleTableInput;
        quill.root.addEventListener('input', handleTableInput);
      } catch (err) {
        console.error('Error initializing Quill editor:', err);
      }
    }

    initQuill();

    return () => {
      active = false;
      if (quillRef.current) {
        if (tableInputHandlerRef.current) quillRef.current.root.removeEventListener('input', tableInputHandlerRef.current);
        quillRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  // Update editor value if changed from outside
  useEffect(() => {
    if (quillRef.current) {
      // Avoid resetting innerHTML if the editor currently has focus.
      // This prevents the cursor jumping to the beginning of the text when typing.
      if (quillRef.current.hasFocus()) {
        return;
      }
      const currentVal = quillRef.current.root.innerHTML;
      const normalizedValue = value === '' ? '<p><br></p>' : value;
      if (currentVal !== normalizedValue) {
        isUpdatingRef.current = true;
        applyHtmlToEditor(quillRef.current, normalizedValue);
        isUpdatingRef.current = false;
      }
    }
  }, [value]);

  const clearMultiSelection = () => {
    selectedBlocksRef.current.forEach((block) => {
      block.classList.remove('ql-multi-selected');
      block.removeAttribute('data-multi-selected');
    });
    selectedBlocksRef.current.clear();
    setSelectedBlockCount(0);
  };

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill || !multiSelectMode) return;

    const handleBlockClick = (event: MouseEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      const target = event.target as HTMLElement;
      const block = target.closest('p,h1,h2,h3,h4,h5,h6,li,blockquote') as HTMLElement | null;
      if (!block || !quill.root.contains(block)) return;
      event.preventDefault();
      event.stopPropagation();
      if (selectedBlocksRef.current.has(block)) {
        selectedBlocksRef.current.delete(block);
        block.classList.remove('ql-multi-selected');
        block.removeAttribute('data-multi-selected');
      } else {
        selectedBlocksRef.current.add(block);
        block.classList.add('ql-multi-selected');
        block.setAttribute('data-multi-selected', 'true');
      }
      setSelectedBlockCount(selectedBlocksRef.current.size);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') clearMultiSelection();
    };

    quill.root.addEventListener('click', handleBlockClick, true);
    document.addEventListener('keydown', handleEscape);
    return () => {
      quill.root.removeEventListener('click', handleBlockClick, true);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [multiSelectMode]);

  useEffect(() => () => clearMultiSelection(), []);

  const getSelectedRanges = () => {
    const quill = quillRef.current;
    if (!quill) return [];
    return Array.from(selectedBlocksRef.current)
      .map((block) => {
        const blot = quill.constructor.find(block);
        if (!blot) return null;
        return { index: quill.getIndex(blot), length: Math.max(1, blot.length()) };
      })
      .filter((range): range is { index: number; length: number } => Boolean(range))
      .sort((a, b) => a.index - b.index);
  };

  const formatSelectedBlocks = (format: string, value: string | boolean | false) => {
    const quill = quillRef.current;
    if (!quill) return;
    const ranges = getSelectedRanges();
    ranges.forEach((range) => {
      if (format === 'align') quill.formatLine(range.index, range.length, format, value, 'user');
      else if (format === 'clean') quill.removeFormat(range.index, range.length, 'user');
      else quill.formatText(range.index, range.length, format, value, 'user');
    });
  };

  const copySelectedBlocks = async () => {
    const text = Array.from(selectedBlocksRef.current)
      .sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)
      .map((block) => block.innerText)
      .join('\n');
    if (text) await navigator.clipboard.writeText(text);
  };

  const deleteSelectedBlocks = () => {
    const quill = quillRef.current;
    if (!quill) return;
    getSelectedRanges().sort((a, b) => b.index - a.index).forEach((range) => {
      quill.deleteText(range.index, range.length, 'user');
    });
    clearMultiSelection();
  };

  const insertTable = () => {
    const quill = quillRef.current;
    if (!quill) return;
    const rowInput = window.prompt('Số hàng của bảng:', '3');
    if (rowInput === null) return;
    const rows = Math.min(20, Math.max(1, Number(rowInput) || 1));
    const columnInput = window.prompt('Số cột của bảng:', '3');
    if (columnInput === null) return;
    const columns = Math.min(10, Math.max(1, Number(columnInput) || 1));
    const range = quill.getSelection(true) || { index: Math.max(0, quill.getLength() - 1), length: 0 };
    const header = `<thead><tr>${Array.from({ length: columns }, (_, index) => `<th>Cột ${index + 1}</th>`).join('')}</tr></thead>`;
    const body = `<tbody>${Array.from({ length: Math.max(1, rows - 1) }, () => `<tr>${Array.from({ length: columns }, () => '<td>Nội dung</td>').join('')}</tr>`).join('')}</tbody>`;
    quill.clipboard.dangerouslyPasteHTML(range.index, `<table>${header}${body}</table><p><br></p>`, 'user');
  };

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
    if (imageUrl && quillRef.current) {
      const quill = quillRef.current;
      const range = quill.getSelection();
      const index = range ? range.index : quill.getLength();
      
      // Insert image block
      quill.insertEmbed(index, 'image', imageUrl);
      
      // Move cursor past the inserted image
      quill.setSelection(index + 1);
    }
  };

  const openProjectLinkModal = () => {
    const quill = quillRef.current;
    if (!quill) return;
    const range = quill.getSelection();
    savedRangeRef.current = range || { index: Math.max(0, quill.getLength() - 1), length: 0 };
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
  const filteredProjects = projects.filter((project) =>
    !normalizedSearch || `${project.name} ${project.location || ''}`.toLocaleLowerCase('vi-VN').includes(normalizedSearch),
  );

  return (
    <div className="rich-text-editor-wrapper">
      <div className="mb-2 flex flex-wrap items-center gap-2">
      {enableProjectLinks ? (
        <button
          type="button"
          onClick={openProjectLinkModal}
          className="inline-flex items-center gap-2 rounded-lg border border-[#B88746]/50 bg-[#FFF9F0] px-3 py-2 text-xs font-bold text-[#8F632F] transition hover:border-[#B88746] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B88746]/40"
        >
          <Link2 className="h-4 w-4" />
          Chèn liên kết dự án
        </button>
      ) : null}
        <button type="button" onClick={insertTable} className="inline-flex items-center gap-2 rounded-lg border border-[#E8DCCB] bg-white px-3 py-2 text-xs font-bold text-[#6E5F51] hover:border-[#B88746] hover:text-[#8F632F]"><Table2 className="h-4 w-4" />Chèn bảng</button>
        <button type="button" aria-pressed={multiSelectMode} onClick={() => { setMultiSelectMode((value) => !value); clearMultiSelection(); }} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${multiSelectMode ? 'border-[#B88746] bg-[#B88746] text-white' : 'border-[#E8DCCB] bg-white text-[#6E5F51]'}`}><MousePointer2 className="h-4 w-4" />Chọn nhiều đoạn{multiSelectMode ? ` (${selectedBlockCount})` : ''}</button>
        {multiSelectMode && selectedBlockCount > 0 ? <>
          {['bold', 'italic', 'underline', 'strike'].map((format) => <button key={format} type="button" onClick={() => formatSelectedBlocks(format, true)} className="rounded border border-[#E8DCCB] bg-white px-2 py-1.5 text-xs font-bold">{format === 'bold' ? 'B' : format === 'italic' ? 'I' : format === 'underline' ? 'U' : 'S'}</button>)}
          <input type="color" aria-label="Màu chữ" title="Màu chữ" onChange={(event) => formatSelectedBlocks('color', event.target.value)} className="h-8 w-8 rounded border border-[#E8DCCB]" />
          <input type="color" aria-label="Màu nền" title="Màu nền" onChange={(event) => formatSelectedBlocks('background', event.target.value)} className="h-8 w-8 rounded border border-[#E8DCCB]" />
          {['', 'center', 'right'].map((align) => <button key={align || 'left'} type="button" onClick={() => formatSelectedBlocks('align', align || false)} className="rounded border border-[#E8DCCB] bg-white px-2 py-1.5 text-[11px]">{align || 'left'}</button>)}
          <button type="button" onClick={() => formatSelectedBlocks('clean', false)} aria-label="Xóa định dạng" className="rounded border border-[#E8DCCB] bg-white p-2"><Eraser className="h-4 w-4" /></button>
          <button type="button" onClick={copySelectedBlocks} aria-label="Sao chép các đoạn đã chọn" className="rounded border border-[#E8DCCB] bg-white p-2"><Copy className="h-4 w-4" /></button>
          <button type="button" onClick={deleteSelectedBlocks} aria-label="Xóa các đoạn đã chọn" className="rounded border border-red-200 bg-white p-2 text-red-600"><Trash2 className="h-4 w-4" /></button>
          <button type="button" onClick={clearMultiSelection} className="rounded border border-[#E8DCCB] bg-white px-3 py-2 text-xs font-bold">Bỏ chọn tất cả</button>
        </> : null}
      </div>
      <div ref={containerRef} className="quill-editor-container" />
      
      <MediaSelectModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleMediaSelect}
        multiple={false}
      />

      {isProjectModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4" onMouseDown={() => setIsProjectModalOpen(false)}>
          <div className="w-full max-w-xl rounded-2xl border border-[#E8DCCB] bg-white p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#1F1B16]">Chèn liên kết dự án</h3>
                <p className="mt-1 text-xs text-[#8C7A6B]">Chọn dự án đã xuất bản để tạo đường dẫn nội bộ.</p>
              </div>
              <button type="button" aria-label="Đóng" onClick={() => setIsProjectModalOpen(false)} className="rounded-full p-2 text-[#8C7A6B] hover:bg-[#FBF8F2]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <label className="mt-4 flex items-center gap-2 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2] px-3 focus-within:border-[#B88746]">
              <Search className="h-4 w-4 text-[#B88746]" />
              <input
                autoFocus
                value={projectSearch}
                onChange={(event) => setProjectSearch(event.target.value)}
                placeholder="Tìm theo tên hoặc vị trí dự án..."
                className="h-11 w-full bg-transparent text-sm text-[#1F1B16] outline-none"
              />
            </label>
            <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
              {isLoadingProjects ? (
                <p className="py-8 text-center text-sm text-[#8C7A6B]">Đang tải dự án...</p>
              ) : filteredProjects.length ? filteredProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => insertProjectLink(project)}
                  className="block w-full rounded-xl border border-[#E8DCCB]/70 px-4 py-3 text-left transition hover:border-[#B88746] hover:bg-[#FFF9F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B88746]/40"
                >
                  <span className="block text-sm font-bold text-[#1F1B16]">{project.name}</span>
                  <span className="mt-1 block text-xs text-[#8C7A6B]">{project.location || `/du-an/${project.slug}`}</span>
                </button>
              )) : (
                <p className="py-8 text-center text-sm text-[#8C7A6B]">Không tìm thấy dự án phù hợp.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <style dangerouslySetInnerHTML={{ __html: `
        .rich-text-editor-wrapper .ql-toolbar.ql-snow {
          border: 1px solid #E8DCCB !important;
          border-top-left-radius: 12px !important;
          border-top-right-radius: 12px !important;
          background-color: #FBF8F2 !important;
          padding: 8px 12px !important;
        }
        .rich-text-editor-wrapper .ql-container.ql-snow {
          border: 1px solid #E8DCCB !important;
          border-top: none !important;
          border-bottom-left-radius: 12px !important;
          border-bottom-right-radius: 12px !important;
          background-color: #ffffff !important;
          min-height: 280px !important;
          font-family: inherit !important;
          font-size: 14px !important;
        }
        .rich-text-editor-wrapper .ql-editor {
          min-height: 280px !important;
          color: #1F1B16 !important;
          line-height: 1.6 !important;
        }
        .rich-text-editor-wrapper .ql-editor table { width: 100%; min-width: 620px; border-collapse: collapse; margin: 1rem 0; background: #fff; }
        .rich-text-editor-wrapper .ql-editor th,
        .rich-text-editor-wrapper .ql-editor td { border: 1px solid #E8DCCB; padding: 8px 10px; text-align: left; vertical-align: top; }
        .rich-text-editor-wrapper .ql-editor thead th { background: #FBF8F2; color: #1F1B16; font-weight: 700; }
        .rich-text-editor-wrapper .ql-container { overflow-x: auto; }
        .rich-text-editor-wrapper .ql-article-table { max-width: 100%; overflow-x: auto; border-radius: 12px; outline: none; }
        .rich-text-editor-wrapper .ql-article-table:focus-within { box-shadow: 0 0 0 2px rgba(184, 135, 70, .35); }
        .rich-text-editor-wrapper .ql-editor .ql-multi-selected { outline: 2px solid #B88746; outline-offset: 2px; background: rgba(184, 135, 70, 0.12); }
        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: #8C7A6B !important;
          opacity: 0.6 !important;
          font-style: normal !important;
        }
      `}} />
    </div>
  );
}
