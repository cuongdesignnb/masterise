'use client';

import React, { useEffect, useRef, useState } from 'react';
import MediaSelectModal from '@/components/admin/MediaSelectModal';
import 'quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const isUpdatingRef = useRef<boolean>(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

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
          quill.root.innerHTML = value;
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
        quillRef.current.root.innerHTML = value;
        isUpdatingRef.current = false;
      }
    }
  }, [value]);

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

  return (
    <div className="rich-text-editor-wrapper">
      <div ref={containerRef} className="quill-editor-container" />
      
      <MediaSelectModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleMediaSelect}
        multiple={false}
      />

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
