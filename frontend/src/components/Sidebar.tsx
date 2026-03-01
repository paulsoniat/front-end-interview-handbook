import React, { useState, useEffect } from 'react';

interface SidebarProps {
  selectedFolder: string;
  onFolderSelect: (folder: string) => void;
  onTagFilter: (tag: string | null) => void;
  activeTag: string | null;
}

const API_BASE = '/api/v1';

const getToken = () => localStorage.getItem('token');

const Sidebar: React.FC<SidebarProps> = ({
  selectedFolder,
  onFolderSelect,
  onTagFilter,
  activeTag,
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsError, setTagsError] = useState<string | null>(null);

  const folders = ['All Notes', 'Personal', 'Work', 'Archived'];

  const fetchTags = async () => {
    setTagsLoading(true);
    setTagsError(null);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/notes/tags`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      const data = await response.json();
      setTags(data.tags || []);
    } catch (err) {
      setTagsError('Could not load tags');
    } finally {
      setTagsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleTagClick = (tag: string) => {
    if (activeTag === tag) {
      onTagFilter(null);
    } else {
      onTagFilter(tag);
    }
  };

  return (
    <div className="w-64 bg-slate-800 h-full flex flex-col border-r border-slate-700">
      {/* App Title */}
      <div className="px-4 py-5 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">Notes</h1>
      </div>

      {/* Folders Section */}
      <div className="px-3 py-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
          Folders
        </p>
        <ul className="space-y-1">
          {folders.map((folder) => (
            <li key={folder}>
              <button
                onClick={() => onFolderSelect(folder)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedFolder === folder
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {folder}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700 mx-3" />

      {/* Tags Section */}
      <div className="px-3 py-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-2 px-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Tags
          </p>
          {activeTag && (
            <button
              onClick={() => onTagFilter(null)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              title="Clear tag filter"
            >
              Clear
            </button>
          )}
        </div>

        {tagsLoading && (
          <p className="text-xs text-slate-500 px-2 py-1">Loading tags...</p>
        )}

        {tagsError && (
          <p className="text-xs text-red-400 px-2 py-1">{tagsError}</p>
        )}

        {!tagsLoading && !tagsError && tags.length === 0 && (
          <p className="text-xs text-slate-500 px-2 py-1 italic">
            No tags yet
          </p>
        )}

        {!tagsLoading && !tagsError && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 px-1">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeTag === tag
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-indigo-500 hover:text-white'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;