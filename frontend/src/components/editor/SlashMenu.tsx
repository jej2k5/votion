'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Image,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlashMenuItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: string;
}

const menuItems: SlashMenuItem[] = [
  { title: 'Text', description: 'Plain text block', icon: <Type className="h-4 w-4" />, command: 'paragraph' },
  { title: 'Heading 1', description: 'Large section heading', icon: <Heading1 className="h-4 w-4" />, command: 'heading1' },
  { title: 'Heading 2', description: 'Medium section heading', icon: <Heading2 className="h-4 w-4" />, command: 'heading2' },
  { title: 'Heading 3', description: 'Small section heading', icon: <Heading3 className="h-4 w-4" />, command: 'heading3' },
  { title: 'Bullet List', description: 'Unordered list', icon: <List className="h-4 w-4" />, command: 'bulletList' },
  { title: 'Numbered List', description: 'Ordered list', icon: <ListOrdered className="h-4 w-4" />, command: 'orderedList' },
  { title: 'To-do', description: 'Checkbox item', icon: <CheckSquare className="h-4 w-4" />, command: 'taskList' },
  { title: 'Quote', description: 'Block quote', icon: <Quote className="h-4 w-4" />, command: 'blockquote' },
  { title: 'Code', description: 'Code block', icon: <Code className="h-4 w-4" />, command: 'codeBlock' },
  { title: 'Image', description: 'Embed an image', icon: <Image className="h-4 w-4" />, command: 'image' },
  { title: 'Divider', description: 'Horizontal line', icon: <Minus className="h-4 w-4" />, command: 'horizontalRule' },
];

interface SlashMenuProps {
  query: string;
  onSelect: (command: string) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export function SlashMenu({ query, onSelect, onClose, position }: SlashMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = menuItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onSelect(filtered[selectedIndex].command);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [filtered, selectedIndex, onSelect, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (filtered.length === 0) return null;

  return (
    <div
      className="fixed z-50 min-w-[220px] rounded-lg border bg-background p-1 shadow-lg"
      style={{ top: position.top, left: position.left }}
    >
      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
        Basic blocks
      </div>
      {filtered.map((item, index) => (
        <button
          key={item.command}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-accent',
            index === selectedIndex && 'bg-accent'
          )}
          onClick={() => onSelect(item.command)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background">
            {item.icon}
          </div>
          <div className="text-left">
            <div className="font-medium">{item.title}</div>
            <div className="text-xs text-muted-foreground">{item.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
