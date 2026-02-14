'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { SlashMenu } from './SlashMenu';
import { blockApi } from '@/lib/api';

interface BlockEditorProps {
  pageId: string;
  initialContent?: string;
  onSave?: () => void;
}

export function BlockEditor({ pageId, initialContent, onSave }: BlockEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Type "/" for commands, or start writing...',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      HorizontalRule,
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-1',
      },
    },
    onUpdate: ({ editor }) => {
      // Auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        handleAutoSave(editor.getJSON());
      }, 1000);

      // Slash menu detection
      const { state } = editor;
      const { from } = state.selection;
      const textBefore = state.doc.textBetween(
        Math.max(0, from - 20),
        from,
        '\n'
      );

      const slashMatch = textBefore.match(/\/([a-zA-Z]*)$/);
      if (slashMatch) {
        setSlashQuery(slashMatch[1]);
        const coords = editor.view.coordsAtPos(from);
        setMenuPosition({ top: coords.bottom + 4, left: coords.left });
        setShowSlashMenu(true);
      } else {
        setShowSlashMenu(false);
      }
    },
  });

  const handleAutoSave = useCallback(
    async (content: object) => {
      try {
        // Save as a single block containing the full editor content
        const blocks = await blockApi.list(pageId);
        if (blocks.data.length > 0) {
          await blockApi.update(blocks.data[0].id, {
            content: { tiptap: content },
          });
        } else {
          await blockApi.create(pageId, {
            type: 'paragraph',
            content: { tiptap: content },
          });
        }
        onSave?.();
      } catch {
        // Silent fail for auto-save
      }
    },
    [pageId, onSave]
  );

  const handleSlashCommand = useCallback(
    (command: string) => {
      if (!editor) return;

      // Delete the slash and query text
      const { state } = editor;
      const { from } = state.selection;
      const textBefore = state.doc.textBetween(
        Math.max(0, from - 20),
        from,
        '\n'
      );
      const slashMatch = textBefore.match(/\/([a-zA-Z]*)$/);
      if (slashMatch) {
        editor
          .chain()
          .focus()
          .deleteRange({
            from: from - slashMatch[0].length,
            to: from,
          })
          .run();
      }

      switch (command) {
        case 'paragraph':
          editor.chain().focus().setParagraph().run();
          break;
        case 'heading1':
          editor.chain().focus().toggleHeading({ level: 1 }).run();
          break;
        case 'heading2':
          editor.chain().focus().toggleHeading({ level: 2 }).run();
          break;
        case 'heading3':
          editor.chain().focus().toggleHeading({ level: 3 }).run();
          break;
        case 'bulletList':
          editor.chain().focus().toggleBulletList().run();
          break;
        case 'orderedList':
          editor.chain().focus().toggleOrderedList().run();
          break;
        case 'taskList':
          editor.chain().focus().toggleTaskList().run();
          break;
        case 'blockquote':
          editor.chain().focus().toggleBlockquote().run();
          break;
        case 'codeBlock':
          editor.chain().focus().toggleCodeBlock().run();
          break;
        case 'image': {
          const url = window.prompt('Image URL:');
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
          break;
        }
        case 'horizontalRule':
          editor.chain().focus().setHorizontalRule().run();
          break;
      }

      setShowSlashMenu(false);
    },
    [editor]
  );

  // Load existing content
  useEffect(() => {
    if (!editor || !pageId) return;

    const loadContent = async () => {
      try {
        const { data: blocks } = await blockApi.list(pageId);
        if (blocks.length > 0 && blocks[0].content) {
          const content = blocks[0].content as { tiptap?: object };
          if (content.tiptap) {
            editor.commands.setContent(content.tiptap);
          }
        }
      } catch {
        // Page might not have blocks yet
      }
    };

    loadContent();
  }, [editor, pageId]);

  return (
    <div className="relative">
      <EditorContent editor={editor} />

      {showSlashMenu && (
        <SlashMenu
          query={slashQuery}
          onSelect={handleSlashCommand}
          onClose={() => setShowSlashMenu(false)}
          position={menuPosition}
        />
      )}
    </div>
  );
}
