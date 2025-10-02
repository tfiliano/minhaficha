"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import "quill/dist/quill.snow.css";

type RichTextEditorProps = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

// Dynamic import para evitar SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="border rounded-md min-h-[200px] p-3 bg-slate-50 dark:bg-slate-900 animate-pulse">
      Carregando editor...
    </div>
  ),
});

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        ["bold", "italic", { header: [2, 3, false] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
      ],
    }),
    []
  );

  const formats = [
    "bold",
    "italic",
    "header",
    "list",
    "align",
  ];

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={content}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Digite o modo de preparo..."}
        className="bg-white dark:bg-slate-950"
      />
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: 200px;
          font-size: 14px;
        }
        .rich-text-editor .ql-editor {
          min-height: 200px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: rgb(148 163 184);
          font-style: normal;
        }
        /* Dark mode */
        .dark .rich-text-editor .ql-toolbar {
          background: rgb(15 23 42);
          border-color: rgb(51 65 85);
        }
        .dark .rich-text-editor .ql-container {
          background: rgb(2 6 23);
          border-color: rgb(51 65 85);
        }
        .dark .rich-text-editor .ql-editor {
          color: rgb(226 232 240);
        }
        .dark .rich-text-editor .ql-stroke {
          stroke: rgb(148 163 184);
        }
        .dark .rich-text-editor .ql-fill {
          fill: rgb(148 163 184);
        }
        .dark .rich-text-editor .ql-picker-label {
          color: rgb(148 163 184);
        }
        .dark .rich-text-editor .ql-toolbar button:hover,
        .dark .rich-text-editor .ql-toolbar button:focus,
        .dark .rich-text-editor .ql-toolbar button.ql-active {
          background: rgb(51 65 85);
        }
        .dark .rich-text-editor .ql-toolbar button:hover .ql-stroke,
        .dark .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: rgb(226 232 240);
        }
        .dark .rich-text-editor .ql-toolbar button:hover .ql-fill,
        .dark .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
          fill: rgb(226 232 240);
        }
      `}</style>
    </div>
  );
}
