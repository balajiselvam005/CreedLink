"use client";

import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Underline as UnderlineIcon,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

interface Props {
  content?: string;
  onChange?: (value: string) => void;
}

export default function AgreementEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder:
          "Enter the agreement terms and conditions here...\n\nExample:\nThis Agreement is entered into on [Date] between...",
      }),
    ],
    content: content ? JSON.parse(content) : undefined,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[350px] focus:outline-none text-slate-200 leading-relaxed prose prose-invert max-w-none",
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange?.(JSON.stringify(json));
    },
  });

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor?.isActive("bold"),
      isItalic: editor?.isActive("italic"),
      isUnderline: editor?.isActive("underline"),
      isH1: editor?.isActive("heading", { level: 1 }),
      isH2: editor?.isActive("heading", { level: 2 }),
      isH3: editor?.isActive("heading", { level: 3 }),
      isBullet: editor?.isActive("bulletList"),
      isOrdered: editor?.isActive("orderedList"),
      isQuote: editor?.isActive("blockquote"),
      alignLeft: editor?.isActive({ textAlign: "left" }),
      alignCenter: editor?.isActive({ textAlign: "center" }),
      alignRight: editor?.isActive({ textAlign: "right" }),
    }),
  });

  if (!editor) return null;

  const toolbarButton =
    "p-2 rounded-lg border border-white/10 bg-slate-950 text-slate-300 hover:bg-white/10 hover:text-white transition";

  const activeButton = "bg-indigo-600 text-white border-indigo-600";

  return (
    <div className="min-h-96 rounded-2xl border border-white/10 bg-slate-900 backdrop-blur-md">
      {/* Toolbar */}

      <div className="flex flex-wrap items-center gap-2 rounded-t-2xl border-b border-white/10 bg-white/5 p-4">
        <button
          className={`${toolbarButton} ${editorState?.isBold ? activeButton : ""}`}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </button>

        <button
          className={`${toolbarButton} ${editorState?.isItalic ? activeButton : ""}`}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </button>

        <button
          className={`${toolbarButton} ${editorState?.isUnderline ? activeButton : ""}`}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={16} />
        </button>

        <button
          className={`${toolbarButton} ${editorState?.isH1 ? activeButton : ""}`}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 size={16} />
        </button>

        <button
          className={`${toolbarButton} ${editorState?.isH2 ? activeButton : ""}`}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 size={16} />
        </button>

        <button
          className={`${toolbarButton} ${editorState?.isH3 ? activeButton : ""}`}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 size={16} />
        </button>

        <button
          className={`${toolbarButton} ${editorState?.isBullet ? activeButton : ""}`}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </button>

        <button
          className={`${toolbarButton} ${editorState?.isOrdered ? activeButton : ""}`}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </button>

        <button
          className={`${toolbarButton} ${editorState?.isQuote ? activeButton : ""}`}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={16} />
        </button>

        <button
          className={`${toolbarButton} ${
            editorState?.alignLeft ? activeButton : ""
          }`}
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft size={16} />
        </button>

        <button
          className={`${toolbarButton} ${
            editorState?.alignCenter ? activeButton : ""
          }`}
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter size={16} />
        </button>

        <button
          className={`${toolbarButton} ${
            editorState?.alignRight ? activeButton : ""
          }`}
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight size={16} />
        </button>

        <button
          className={toolbarButton}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo size={16} />
        </button>

        <button
          className={toolbarButton}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo size={16} />
        </button>
      </div>

      {/* Editor */}

      <div className="p-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
