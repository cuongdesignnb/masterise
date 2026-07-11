'use client';

import React, { useEffect, useRef, useState } from 'react';
import MediaSelectModal from '@/components/admin/MediaSelectModal';
import { Link2, Search, X } from 'lucide-react';
import { projectService } from '@/services/projectService';
import type { Project } from '@/types/api';
import 'quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  enableProjectLinks?: boolean;
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
            const html = quill.root.innerHTML;
            const cleanHtml = html === '<p><br></p>' ? '' : html;
            onChange(cleanHtml);
          }
        });
      } catch (err) {
        console.error('Error initializing Quill editor:', err);
      }
    }

    initQuill();

    return () => {
      active = false;
      if (quillRef.current) {
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
      {enableProjectLinks ? (
        <button
          type="button"
          onClick={openProjectLinkModal}
          className="mb-2 inline-flex items-center gap-2 rounded-lg border border-[#B88746]/50 bg-[#FFF9F0] px-3 py-2 text-xs font-bold text-[#8F632F] transition hover:border-[#B88746] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B88746]/40"
        >
          <Link2 className="h-4 w-4" />
          Chèn liên kết dự án
        </button>
      ) : null}
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
        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: #8C7A6B !important;
          opacity: 0.6 !important;
          font-style: normal !important;
        }
      `}} />
    </div>
  );
}
