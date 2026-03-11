'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Heading2, Heading3, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  content?: object
  onChange?: (json: object, text: string) => void
  placeholder?: string
  readOnly?: boolean
  className?: string
}

export function RichTextEditor({ content, onChange, placeholder, readOnly, className }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder ?? 'Start writing...' }),
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: content ?? '',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON(), editor.getText())
    },
  })

  if (!editor) return null

  return (
    <div className={cn('', className)}>
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 pb-2 mb-3">
          {[
            { icon: <Bold className="h-4 w-4" />, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), title: 'Bold' },
            { icon: <Italic className="h-4 w-4" />, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), title: 'Italic' },
            { icon: <Heading2 className="h-4 w-4" />, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }), title: 'H2' },
            { icon: <Heading3 className="h-4 w-4" />, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }), title: 'H3' },
            { icon: <List className="h-4 w-4" />, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), title: 'Bullet list' },
            { icon: <ListOrdered className="h-4 w-4" />, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), title: 'Numbered list' },
            { icon: <Quote className="h-4 w-4" />, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote'), title: 'Quote' },
            { icon: <LinkIcon className="h-4 w-4" />, action: () => {
              const url = window.prompt('URL')
              if (url) editor.chain().focus().setLink({ href: url }).run()
            }, active: editor.isActive('link'), title: 'Link' },
          ].map(({ icon, action, active, title }, i) => (
            <button
              key={i}
              type="button"
              onClick={action}
              title={title}
              className={cn(
                'p-1.5 rounded text-gray-600 hover:bg-gray-100 transition-colors',
                active && 'bg-indigo-100 text-indigo-700'
              )}
            >
              {icon}
            </button>
          ))}
        </div>
      )}
      <EditorContent
        editor={editor}
        className={cn(
          'prose prose-sm max-w-none focus:outline-none',
          '[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[200px]',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none'
        )}
      />
    </div>
  )
}
