"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

type RichTextEditorProps = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  // Dynamic import to avoid SSR issues with Quill
  const ReactQuill = useMemo(
    () =>
      dynamic(() => import("react-quill"), {
        ssr: false,
        loading: () => (
          <div className="border rounded-md p-4 min-h-[200px] bg-slate-50 dark:bg-slate-900">
            Carregando editor...
          </div>
        ),
      }),
    []
  );

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "code-block"],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "blockquote",
    "code-block",
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
        className="bg-white dark:bg-slate-950 rounded-md"
      />
    </div>
  );
}
