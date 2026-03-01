import React, { useState, useEffect, useCallback, useRef } from 'react';
import TagInput from './TagInput';

interface Note {
  id: number;
  title: string;
  body: string;
  tags: string[];
  updated_at: string;
}

interface NoteEditorProps {
  note: Note;
  onNoteUpdate: (updatedNote: Note) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onNoteUpdate }) => {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTitle(note.title);
    setBody(note.body);
    setTags(note.tags || []);
  }, [note.id]);

  const saveNote = useCallback(
    async (updatedTitle: string, updatedBody: string, updatedTags: string[]) => {
      setSaving(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/notes/${note.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: updatedTitle,
            body: updatedBody,
            tags: updatedTags,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save note');
        }

        const updatedNote = await response.json();
        onNoteUpdate(updatedNote);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error saving note:', error);
      } finally {
        setSaving(false);
      }
    },
    [note.id, onNoteUpdate]
  );

  const scheduleSave = useCallback(
    (updatedTitle: string, updatedBody: string, updatedTags: string[]) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveNote(updatedTitle, updatedBody, updatedTags);
      }, 800);
    },
    [saveNote]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    scheduleSave(newTitle, body, tags);
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBody = e.target.value;
    setBody(newBody);
    scheduleSave(title, newBody, tags);
  };

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    scheduleSave(title, body, newTags);
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-700">
        <span className="text-sm text-slate-400">
          {saving ? (
            <span className="text-indigo-400">Saving...</span>
          ) : lastSaved ? (
            <span>
              Saved at{' '}
              {lastSaved.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          ) : null}
        </span>
      </div>

      <div className="flex flex-col flex-1 px-6 py-4 overflow-y-auto">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          className="w-full bg-transparent text-2xl font-semibold text-slate-100 placeholder-slate-500 border-none outline-none mb-3"
        />

        <div className="mb-4">
          <TagInput tags={tags} onTagsChange={handleTagsChange} />
        </div>

        <textarea
          value={body}
          onChange={handleBodyChange}
          placeholder="Start writing..."
          className="flex-1 w-full bg-transparent text-slate-300 placeholder-slate-500 border-none outline-none resize-none text-base leading-relaxed"
          style={{ minHeight: '400px' }}
        />
      </div>
    </div>
  );
};

export default NoteEditor;